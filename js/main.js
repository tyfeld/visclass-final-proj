let _width = $(window).width()
let _height = $(window).height()
let width = 0.98 * _width
let height = 0.98 * _height
let fontFamily
let data_file = '../data/test3.csv'
let ua = navigator.userAgent.toLowerCase()
fontFamily = "Khand-Regular"
if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
    fontFamily = "PingFangSC-Regular"
}

//fontFamily = "";
d3.select("body")
    .style("font-family", fontFamily)




d3.csv(data_file).then(function (DATA) {
    data = DATA
    // remove data without x_attr or y_attr
    //data = data.filter((d, i) => (d[x_attr] != '' && d[y_attr] != '' && d[z_attr] != ''))
    //console.log(data)
   // draw_chart2()
})

