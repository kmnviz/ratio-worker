/**
 * Sorts array of objects with timestamp
 *
 * @param data {Object[{timestamp: string}]}
 * @param reverse {boolean}
 */
const sortByTimestamp = (data, reverse = false) => {
    data.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    return reverse ? data.reverse() : data;
}

/**
 * Pauses process for a while
 *
 * @param ms {number}
 * @returns {Promise<unknown>}
 */
const pauseFor = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

/**
 * @param timestamp {number}
 * @param withHours {boolean}
 *
 * @returns {string};
 */
const timestampToDate = (timestamp, withHours = true) => {
    const date = new Date(timestamp);
    date.setMinutes(-180)

    let dd, mm, yy, hh, ii, ss;

    dd = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    mm = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    yy = date.getFullYear();
    hh = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    ii = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    ss = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

    return !withHours ? `${mm}-${dd}-${yy}` : `${mm}-${dd}-${yy} ${hh}:${ii}:${ss}`
};

module.exports = {
    sortByTimestamp,
    pauseFor,
    timestampToDate
}
