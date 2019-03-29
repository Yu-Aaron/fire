/**
 * Created by Charlie on 14-11-13.
 */
var learningList = [];
var id = 0;
module.exports = {
    get: function (req, res) {
        res.json([
            {name: '名称', method: 'text', infor: 'test'},
            {name: '安全性分区', method: 'select', infor: ["外部网络区", "PLC区", "现场控制区", "高威胁设备区"]},
            {name: '标签', method: 'select', infor: ["1", "PLC区", "现场控制区", "高威胁设备区"]},
            {name: '硬件接口', method: 'select', infor: ['2', "外部网络区", "PLC区", "现场控制区", "高威胁设备区"]},
            {name: '漏洞严重性', method: 'select', infor: ["外部网络区", "PLC区", "现场控制区", "高威胁设备区"]},
            {name: '设备重要性', method: 'select', infor: ["外部网络区", "PLC区", "现场控制区", "高威胁设备区"]},
            {name: '使用通讯协议', method: 'select', infor: ["外部网络区", "PLC区", "现场控制区", "高威胁设备区"]},
            {name: '所属子网', method: 'select', infor: ["外部网络区", "PLC区", "现场控制区", "高威胁设备区"]},
            {name: '厂商', method: 'select', infor: ["外部网络区", "PLC区", "现场控制区", "高威胁设备区"]}
        ]);
    }
}
