/**
 * Alarm Filter
 */
(function () {
    'use strict';

    angular
        .module('southWest.filters')
        .filter('alarmTimeDiff', alarmTimeDiff);

    function alarmTimeDiff() {
        var timeList = ['asDays', 'asHours', 'asMinutes', 'asSeconds'];
        var textList = ['天前', '小时前', '分钟前', '秒前'];
        return function (timestamp, current) {
            var time, suffix = '刚刚';
            var ms = new Date(current) - new Date(timestamp);
            var d = moment.duration(ms);

            for (var i = 0, l = timeList.length; i < l; i++) {
                time = Math.floor(d[timeList[i]]());
                if (time) {
                    suffix = textList[i];
                    break;
                }
            }
            return (time || '') + suffix;
        };
    }
})();