// 如果设置默认颜色组，则从颜色组中选则
const colors = [
    '#ff4757', '#7bed9f', '#70a1ff', '#5352ed', '#2ed573', '#1e90ff', '#3742fa', '#eccc68', '#ff7f50', '#ff6b81', '#ffa502', '#ff6348', 
];

const defaultBgColor = '';

function colorFrom(str) {
    if (!str) return defaultBgColor;

    if (colors.length) {
        const num = +strToNum(str, 10);

        return colors[num % colors.length];
    }

    str =  (str + str[0] + str[0]).substring(0, 3)
    return '#' + strToNum(str, 16);
}

function strToNum(str, radix=2) {
    let output = "";
    for (var i = 0; i < str.length; i++) {
        output += str[i].charCodeAt(0).toString(radix);
    }
    return output;
}

module.exports = {
    colorFrom
}