/**
 * Array Diff
 *
 * Based on https://github.com/google/diff-match-patch
 *
 * This library implements Myer's diff algorithm which is generally considered to be the best general-purpose diff.
 * A layer of pre-diff speedups and post-diff cleanups surround the diff algorithm, improving both performance and output quality.
 */

/**
 * @fileoverview Computes the difference between two texts to create a editor prescription.
 * Applies the prescription onto another text, allowing for errors.
 */

/**
 * Class containing the diff, match and patch methods.
 * @constructor
 */
function diff_match_patch() {

    // Defaults.
    // Redefine these in your program to override the defaults.

    // Number of seconds to map a diff before giving up (0 for infinity).
    this.Diff_Timeout = 1.0;
}


//  DIFF FUNCTIONS


/**
 * The data structure representing a diff is an array of tuples:
 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
 */
const DIFF_DELETE = -1;
const DIFF_INSERT = 1;
const DIFF_EQUAL = 0;


/**
 * Find the differences between two texts.  Simplifies the problem by stripping
 * any common prefix or suffix off the texts before diffing.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} opt_deadline Optional time when the diff should be complete
 *     by.  Used internally for recursive calls.  Users should set DiffTimeout
 *     instead.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 */
diff_match_patch.prototype.diff_main = function(text1: string, text2: string, opt_deadline: number) {
    // Set a deadline by which time the diff must be complete.
    if (typeof opt_deadline === 'undefined') {
        if (this.Diff_Timeout <= 0) {
            opt_deadline = Number.MAX_VALUE;
        } else {
            opt_deadline = (new Date).getTime() + this.Diff_Timeout * 1000;
        }
    }
    const deadline = opt_deadline;

    // Check for null inputs.
    if (text1 === null || text2 === null) {
        throw new Error('Null input. (diff_main)');
    }

    // Check for equality (speedup).
    if (text1 === text2) {
        if (text1.length) {
            return [[DIFF_EQUAL, text1]];
        }
        return [];
    }

    // Trim off common prefix (speedup).
    let commonlength = this.diff_commonPrefix(text1, text2);

    const commonprefix = text1.slice(0, commonlength);
    text1 = text1.slice(commonlength);
    text2 = text2.slice(commonlength);

    // Trim off common suffix (speedup).
    commonlength = this.diff_commonSuffix(text1, text2);
    const commonsuffix = text1.slice(text1.length - commonlength);
    text1 = text1.slice(0, text1.length - commonlength);
    text2 = text2.slice(0, text2.length - commonlength);

    // Compute the diff on the middle block.
    const diffs = this.diff_compute_(text1, text2, deadline);

    // Restore the prefix and suffix.
    if (commonprefix.length) {
        diffs.unshift([DIFF_EQUAL, commonprefix]);
    }
    if (commonsuffix.length) {
        diffs.push([DIFF_EQUAL, commonsuffix]);
    }
    this.diff_cleanupMerge(diffs);
    return diffs;
};


/**
 * Find the differences between two texts.  Assumes that the texts do not
 * have any common prefix or suffix.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} deadline Time when the diff should be complete by.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_compute_ = function(text1: string, text2: string, deadline: number) {
    let diffs: any;

    if (!text1.length) {
        // Just add some text (speedup).
        return [[DIFF_INSERT, text2]];
    }

    if (!text2.length) {
        // Just delete some text (speedup).
        return [[DIFF_DELETE, text1]];
    }

    const longtext = text1.length > text2.length ? text1 : text2;
    const shorttext = text1.length > text2.length ? text2 : text1;
    let i = this.find_csa(longtext, shorttext);
    if (i !== -1) {
        // Shorter text is inside the longer text (speedup).
        //console.log();
        diffs = [[DIFF_INSERT, longtext.slice(0, i)], [DIFF_EQUAL, shorttext], [DIFF_INSERT, longtext.slice(i + shorttext.length)]];

        // Swap insertions for deletions if diff is reversed.
        if (text1.length > text2.length) {
            diffs[0][0] = diffs[2][0] = DIFF_DELETE;
        }

        // Remove diff with empty value
        if (!diffs[0][1].length) {
            diffs.shift();
        }

        return diffs;
    }

    if (shorttext.length === 1) {
        // Single character string.
        // After the previous speedup, the character can't be an equality.
        return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
    }

    // Check to see if the problem can be split in two.
    const hm = this.diff_halfMatch_(text1, text2);
    if (hm) {
        // A half-match was found, sort out the return data.
        const text1_a = hm[0];
        const text1_b = hm[1];
        const text2_a = hm[2];
        const text2_b = hm[3];
        const mid_common = hm[4];
        // Send both pairs off for separate processing.
        const diffs_a = this.diff_main(text1_a, text2_a, deadline);
        const diffs_b = this.diff_main(text1_b, text2_b, deadline);
        // Merge the results.
        return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
    }

    return this.diff_bisect_(text1, text2, deadline);
};

/**
 * Find the 'middle snake' of a diff, split the problem in two
 * and return the recursively constructed diff.
 * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} deadline Time at which to bail if not yet complete.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_bisect_ = function(text1: string, text2: string, deadline: number) {
    // Cache the text lengths to prevent multiple calls.
    const text1_length = text1.length;
    const text2_length = text2.length;
    const max_d = Math.ceil((text1_length + text2_length) / 2);
    const v_offset = max_d;
    const v_length = 2 * max_d;
    const v1 = new Array(v_length);
    const v2 = new Array(v_length);
    // Setting all elements to -1 is faster in Chrome & Firefox than mixing
    // integers and undefined.
    for (let x = 0; x < v_length; x++) {
        v1[x] = -1;
        v2[x] = -1;
    }
    v1[v_offset + 1] = 0;
    v2[v_offset + 1] = 0;
    const delta = text1_length - text2_length;
    // If the total number of characters is odd, then the front path will collide
    // with the reverse path.
    const front = (delta % 2 !== 0);
    // Offsets for start and end of k loop.
    // Prevents mapping of space beyond the grid.
    let k1start = 0;
    let k1end = 0;
    let k2start = 0;
    let k2end = 0;
    for (let d = 0; d < max_d; d++) {
        // Bail out if deadline is reached.
        if ((new Date()).getTime() > deadline) {
            break;
        }

        // Walk the front path one step.
        for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
            const k1_offset = v_offset + k1;
            let x1;
            if (k1 === -d || (k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
                x1 = v1[k1_offset + 1];
            } else {
                x1 = v1[k1_offset - 1] + 1;
            }
            let y1 = x1 - k1;
            while (x1 < text1_length && y1 < text2_length && text1[x1] === text2[y1]) {
                x1++;
                y1++;
            }
            v1[k1_offset] = x1;
            if (x1 > text1_length) {
                // Ran off the right of the graph.
                k1end += 2;
            } else if (y1 > text2_length) {
                // Ran off the bottom of the graph.
                k1start += 2;
            } else if (front) {
                let k2_offset = v_offset + delta - k1;
                if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] !== -1) {
                    // Mirror x2 onto top-left coordinate system.
                    let x2 = text1_length - v2[k2_offset];
                    if (x1 >= x2) {
                        // Overlap detected.
                        return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                    }
                }
            }
        }

        // Walk the reverse path one step.
        for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
            const k2_offset = v_offset + k2;
            let x2;
            if (k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
                x2 = v2[k2_offset + 1];
            } else {
                x2 = v2[k2_offset - 1] + 1;
            }
            let y2 = x2 - k2;
            while (x2 < text1_length && y2 < text2_length &&
            text1[text1_length - x2 - 1] === text2[text2_length - y2 - 1]) {
                x2++;
                y2++;
            }
            v2[k2_offset] = x2;
            if (x2 > text1_length) {
                // Ran off the left of the graph.
                k2end += 2;
            } else if (y2 > text2_length) {
                // Ran off the top of the graph.
                k2start += 2;
            } else if (!front) {
                const k1_offset = v_offset + delta - k2;
                if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] !== -1) {
                    let x1 = v1[k1_offset];
                    let y1 = v_offset + x1 - k1_offset;
                    // Mirror x2 onto top-left coordinate system.
                    x2 = text1_length - x2;
                    if (x1 >= x2) {
                        // Overlap detected.
                        return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                    }
                }
            }
        }
    }
    // Diff took too long and hit the deadline or
    // number of diffs equals number of characters, no commonality at all.
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
};


/**
 * Given the location of the 'middle snake', split the diff in two parts
 * and recurse.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} x Index of split point in text1.
 * @param {number} y Index of split point in text2.
 * @param {number} deadline Time at which to bail if not yet complete.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_bisectSplit_ = function(text1: string, text2: string, x: number, y: number, deadline: number) {
    const text1a = text1.slice(0, x);
    const text2a = text2.slice(0, y);
    const text1b = text1.slice(x);
    const text2b = text2.slice(y);

    // Compute both diffs serially.
    const diffs = this.diff_main(text1a, text2a, deadline);
    const diffsb = this.diff_main(text1b, text2b, deadline);
    return diffs.concat(diffsb);
};

/**
 * Determine the common prefix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the start of each
 *     string.
 */
diff_match_patch.prototype.diff_commonPrefix = function(text1: string, text2: string) {
    // Quick check for common null cases.
    if (!text1.length || !text2.length || text1[0] !== text2[0]) {
        return 0;
    }
    // Binary search.
    // Performance analysis: http://neil.fraser.name/news/2007/10/09/
    let pointermin = 0;
    let pointermax = Math.min(text1.length, text2.length);
    let pointermid = pointermax;
    let pointerstart = 0;
    while (pointermin < pointermid) {
        if (text1.slice(pointerstart, pointermid) === text2.slice(pointerstart, pointermid)) {
            pointermin = pointermid;
            pointerstart = pointermin;
        } else {
            pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    return pointermid;
};

/**
 * Determine the common suffix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of each string.
 */
diff_match_patch.prototype.diff_commonSuffix = function(text1: string, text2: string) {
    // Quick check for common null cases.
    if (!text1.length || !text2.length ||
        text1[text1.length - 1] !== text2[text2.length - 1]) {
        return 0;
    }
    // Binary search.
    // Performance analysis: http://neil.fraser.name/news/2007/10/09/
    let pointermin = 0;
    let pointermax = Math.min(text1.length, text2.length);
    let pointermid = pointermax;
    let pointerend = 0;
    while (pointermin < pointermid) {
        if (this.compare_arrays(text1.slice(text1.length - pointermid, text1.length - pointerend), text2.slice(text2.length - pointermid, text2.length - pointerend))) {
            pointermin = pointermid;
            pointerend = pointermin;
        } else {
            pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    return pointermid;
};

/**
 * Do the two texts share a slice which is at least half the length of the
 * longer text?
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {Array.<string>} Five element Array, containing the prefix of
 *     text1, the suffix of text1, the prefix of text2, the suffix of
 *     text2 and the common middle.  Or null if there was no match.
 * @private
 */
diff_match_patch.prototype.diff_halfMatch_ = function(text1: string, text2: string) {
    if (this.Diff_Timeout <= 0) {
        // Don't risk returning a non-optimal diff if we have unlimited time.
        return null;
    }
    var longtext = text1.length > text2.length ? text1 : text2;
    var shorttext = text1.length > text2.length ? text2 : text1;
    if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
        return null;  // Pointless.
    }
    var dmp = this;  // 'this' becomes 'window' in a closure.

    /**
     * Does a slice of shorttext exist within longtext such that the slice
     * is at least half the length of longtext?
     * Closure, but does not reference any external variables.
     * @param {string} longtext Longer string.
     * @param {string} shorttext Shorter string.
     * @param {number} i Start index of quarter length slice within longtext.
     * @return {Array.<string>} Five element Array, containing the prefix of
     *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
     *     of shorttext and the common middle.  Or null if there was no match.
     * @private
     */
    function diff_halfMatchI_(longtext: string, shorttext: string, i: number) {
        // Start with a 1/4 length slice at position i as a seed.
        const seed = longtext.slice(i, i + Math.floor(longtext.length / 4));
        let j = -1;
        let best_common: any = [];
        let best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;

        while ((j = dmp.find_csa(shorttext, seed, j + 1)) !== -1) {
            const prefixLength = dmp.diff_commonPrefix(longtext.slice(i), shorttext.slice(j));
            const suffixLength = dmp.diff_commonSuffix(longtext.slice(0, i), shorttext.slice(0, j));
            if (best_common.length < suffixLength + prefixLength) {
                best_common = shorttext.slice(j - suffixLength, j);
                best_common.push.apply(best_common, shorttext.slice(j, j + prefixLength));
                best_longtext_a = longtext.slice(0, i - suffixLength);
                best_longtext_b = longtext.slice(i + prefixLength);
                best_shorttext_a = shorttext.slice(0, j - suffixLength);
                best_shorttext_b = shorttext.slice(j + prefixLength);
            }
        }
        if (best_common.length * 2 >= longtext.length) {
            //console.log(best_common);
            return [best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b, best_common];
        } else {
            return null;
        }
    }

    // First check if the second quarter is the seed for a half-match.
    const hm1 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 4));
    // Check again based on the third quarter.
    const hm2 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 2));
    let hm;
    if (!hm1 && !hm2) {
        return null;
    } else if (!hm2) {
        hm = hm1;
    } else if (!hm1) {
        hm = hm2;
    } else {
        // Both matched.  Select the longest.
        hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
    }

    // A half-match was found, sort out the return data.
    let text1_a, text1_b, text2_a, text2_b;
    if (text1.length > text2.length) {
        text1_a = hm[0];
        text1_b = hm[1];
        text2_a = hm[2];
        text2_b = hm[3];
    } else {
        text2_a = hm[0];
        text2_b = hm[1];
        text1_a = hm[2];
        text1_b = hm[3];
    }
    const mid_common = hm[4];
    return [text1_a, text1_b, text2_a, text2_b, mid_common];
};

/**
 * Reorder and merge like edit sections.  Merge equalities.
 * Any edit section can move as long as it doesn't cross an equality.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupMerge = function(diffs: any[]) {
    diffs.push([DIFF_EQUAL, []]);  // Add a dummy entry at the end.
    var pointer = 0;
    var count_delete = 0;
    var count_insert = 0;
    var text_delete: string[] = [];
    var text_insert: string[] = [];
    var commonlength;
    while (pointer < diffs.length) {
        switch (diffs[pointer][0]) {
            case DIFF_INSERT:
                count_insert++;
                text_insert.push.apply(text_insert, diffs[pointer][1]);
                pointer++;
                break;
            case DIFF_DELETE:
                count_delete++;
                text_delete.push.apply(text_delete, diffs[pointer][1]);
                pointer++;
                break;
            case DIFF_EQUAL:
                // Upon reaching an equality, check for prior redundancies.
                if (count_delete + count_insert > 1) {
                    if (count_delete !== 0 && count_insert !== 0) {
                        // Factor out any common prefixies.
                        commonlength = this.diff_commonPrefix(text_insert, text_delete);
                        if (commonlength !== 0) {
                            const diffItem = diffs[pointer - count_delete - count_insert - 1];

                            if ((pointer - count_delete - count_insert) > 0 && diffItem[0] === DIFF_EQUAL) {
                                diffItem[1].push.apply(diffItem[1], text_insert.slice(0, commonlength));
                            } else {
                                diffs.splice(0, 0, [DIFF_EQUAL, text_insert.slice(0, commonlength)]);
                                pointer++;
                            }
                            text_insert = text_insert.slice(commonlength);
                            text_delete = text_delete.slice(commonlength);
                        }
                        // Factor out any common suffixies.
                        commonlength = this.diff_commonSuffix(text_insert, text_delete);
                        if (commonlength !== 0) {
                            const diffItem = diffs[pointer][1];
                            diffItem.unshift.apply(diffItem, text_insert.slice(text_insert.length - commonlength));
                            text_insert = text_insert.slice(0, text_insert.length - commonlength);
                            text_delete = text_delete.slice(0, text_delete.length - commonlength);
                        }
                    }
                    // Delete the offending records and add the merged ones.
                    if (count_delete === 0) {
                        diffs.splice(pointer - count_insert, count_delete + count_insert, [DIFF_INSERT, text_insert]);
                    } else if (count_insert === 0) {
                        diffs.splice(pointer - count_delete, count_delete + count_insert, [DIFF_DELETE, text_delete]);
                    } else {
                        diffs.splice(pointer - count_delete - count_insert, count_delete + count_insert, [DIFF_DELETE, text_delete], [DIFF_INSERT, text_insert]);
                    }
                    pointer = pointer - count_delete - count_insert +
                        (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
                } else if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
                    // Merge this equality with the previous one.
                    const prevDiffValues = diffs[pointer - 1][1];
                    const diffValues = diffs[pointer][1];

                    prevDiffValues.push.apply(prevDiffValues, diffValues.splice(1, diffValues.length));
                    diffs.splice(pointer, 1);
                } else {
                    pointer++;
                }
                count_insert = 0;
                count_delete = 0;
                text_delete = [];
                text_insert = [];
                break;
        }
    }
    if (!diffs[diffs.length - 1][1].length) {
        diffs.pop();  // Remove the dummy entry at the end.
    }

    // Second pass: look for single edits surrounded on both sides by equalities
    // which can be shifted sideways to eliminate an equality.
    // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
    var changes = false;
    pointer = 1;
    // Intentionally ignore the first and last element (don't need checking).
    while (pointer < diffs.length - 1) {
        if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
            // This is a single edit surrounded by equalities.
            if (diffs[pointer][1].slice(diffs[pointer][1].length - diffs[pointer - 1][1].length) === diffs[pointer - 1][1]) {
                // Shift the edit over the previous equality.
                diffs[pointer][1] = diffs[pointer - 1][1] +
                    diffs[pointer][1].slice(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
                diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
                diffs.splice(pointer - 1, 1);
                changes = true;
            } else if (diffs[pointer][1].slice(0, diffs[pointer + 1][1].length) === diffs[pointer + 1][1]) {
                // Shift the edit over the next equality.
                const prevDiffValues = diffs[pointer - 1][1];
                prevDiffValues.push.apply(prevDiffValues, diffs[pointer + 1][1]);
                diffs[pointer][1] =
                    diffs[pointer][1].slice(diffs[pointer + 1][1].length) +
                    diffs[pointer + 1][1];
                diffs.splice(pointer + 1, 1);
                changes = true;
            }
        }
        pointer++;
    }
    // If shifts were made, the diff needs reordering and another shift sweep.
    if (changes) {
        this.diff_cleanupMerge(diffs);
    }
};

/**
 * Find subarray in array
 * @param arr
 * @param subarr
 * @param from_index
 * @returns {*}
 */
diff_match_patch.prototype.find_csa = function(arr: any[], subarr: any[], from_index: number) {
    let i = from_index >>> 0,
        sl = subarr.length,
        l = arr.length + 1 - sl;

    loop: for (; i<l; i++) {
        for (let j=0; j<sl; j++)
            if (arr[i+j] !== subarr[j])
                continue loop;
        return i;
    }
    return -1;
};

/**
 * Compare two arrays
 * @param arr1
 * @param arr2
 * @returns {boolean}
 */
diff_match_patch.prototype.compare_arrays = function(arr1: any[], arr2: any[]) {
    let i = arr1.length;

    if (i !== arr2.length) return false;

    while (i--) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true
};

diff_match_patch.prototype.transform_to_splice_arguments = function(diffs: any[]) {
    const sDiffs = [];

    for (let i = 0, cursor = 0; i < diffs.length; i++) {
        const diff = diffs[i];
        const sDiff = [cursor];

        switch (diff[0]) {
            case DIFF_INSERT:
                const newItems = diff[1];
                sDiff.push(0);
                sDiff.push.apply(sDiff, newItems);
                cursor += newItems.length;
                sDiffs.push(sDiff);
                break;

            case DIFF_DELETE:
                sDiff.push(diff[1].length);

                const nextDiff = diffs[i + 1];
                if (nextDiff && nextDiff[0] === DIFF_INSERT) {
                    const newItems = nextDiff[1];
                    sDiff.push.apply(sDiff, newItems);
                    i++;
                    cursor += newItems.length;
                }
                sDiffs.push(sDiff);
                break;

            case DIFF_EQUAL:
                cursor += diff[1].length;
                break;
        }
    }

    return sDiffs;
};

/**
 * Make editor prescriptions to transform one array to another. What element should be removed, what - added
 * - Arrays should contain unique elements
 * - Optimised for arrays with minimum differences
 * - Instruction has format like splice arguments [index, deleteCount, newItem]
 *
 * Example:
 *
 *   const instructions = getTransformInstructions(oldArr, newArr)
 *
 *   // Transform oldArr to newArr by instructions
 *   instructions.forEach(args => oldArr.splice.apply(oldArr, args))
 *
 * @param oldArr
 * @param newArr
 * @param deadline Optional time when the diff should be complete by.
 * @returns {[number , number , any, ...][]} List of editor prescriptions (arguments for splice method)
 */
diff_match_patch.prototype.diff = function(oldArr: any[], newArr: any[], deadline: number) {
    return this.transform_to_splice_arguments(this.diff_main(oldArr, newArr, deadline));
};

export const myer = new (diff_match_patch as any)();