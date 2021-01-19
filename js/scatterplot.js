let _width = $(window).width()
let _height = $(window).height()
let width = 0.98 * _width
let height = 0.98 * _height
let fontFamily
let data_file = '../data/VIS2020.csv'
let ua = navigator.userAgent.toLowerCase()
fontFamily = "Khand-Regular"
if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
    fontFamily = "PingFangSC-Regular"
}

let x_attr = 'created_at';
let y_attr = 'hot';

//fontFamily = "";
d3.select("body")
    .style("font-family", fontFamily)

function func(x){
    x = 60000000 - (60000000 - x) / 2
    return x / 3 / 60000000 * x / 60000000 * x + 40000000
}

function get_time(str) {
    let time = ((((parseInt(str.slice(2, 4)) * 12 + parseInt(str.slice(5, 7))) * 31 + parseInt(str.slice(8, 10))) * 24 + parseInt(str.slice(11, 13))) * 60 + 
        parseInt(str.slice(14, 16))) * 60 + parseInt(str.slice(17, 19)) - 600000000
    if (time < -100000000) return time
    if (time < 60000000) return func(time)
    return time;
}

function get_x_min_max(data, attr) {
    let min = 1e9;
    let max = 0;
    data.forEach(d => {
        let str = d[attr];
        let v = get_time(str);
        // console.log(v)
        
        if (v > max)
            max = v;
        if (v < min)
            min = v;
    });

    return [min, max];
}

function get_y_min_max(data) {
    let min = 1e9;
    let max = 0;
    data.forEach(d => {
        let replies = parseInt(d['replies_count']);
        let retweets = parseInt(d['retweets_count']);
        let likes = parseInt(d['likes_count']);
        let v = Math.pow(replies + retweets + likes * 0.5, 1/4);
        if (v > max) max = v;
        if (v < min) min = v;
    });
    return [min, max];
}

function draw_main() {
    let padding = { 'left': 0.1*width, 'bottom':0.35*height, 'top':0.35*height, 'right':0.1*width };
    let svg = d3.select('#container')
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    svg.append('g')
        .attr('transform', `translate(${padding.left+(width-padding.left-padding.right)/2}, ${padding.top})`)
    
    let x = d3.scaleLinear()
        .domain(get_x_min_max(data, x_attr))
        .range([padding.left, width-padding.right]);
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d => d);
    
    let y = d3.scaleLinear()
        .domain(get_y_min_max(data))
        .range([height-padding.bottom, padding.top]);
    let axis_y = d3.axisLeft()
        .scale(y)
        .ticks(10)
        .tickFormat(d => d);
    
    // x axis
    svg.append('g')
        .attr('transform', `translate(${0}, ${height-padding.bottom})`)
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.4rem');
    
    svg.append('g')
        .attr('transform', `translate(${padding.left+(width-padding.left-padding.right)/2}, ${height-padding.bottom})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dx', '-0.4rem')
        .attr('dy', 0.08*height)
        .text('time');
    
    // y axis
    svg.append('g')
        .attr('transform', `translate(${padding.left}, ${0})`)
        .call(axis_y)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.4rem');
    
    svg.append('g')
        .attr('transform', `translate(${padding.left}, ${height/2})
                rotate(-90)`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dy', -height*0.12)
        .text(y_attr)
    
    // points
    svg.append('g')
        .selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('class', 'point')
        .attr('cx', (d, i) => {
            let str = d[x_attr];
            console.log(str)
            console.log(get_time(str))
            return x(get_time(str));
        })
        .attr('cy', (d, i) => {
            let replies = parseInt(d['replies_count']);
            let retweets = parseInt(d['retweets_count']);
            let likes = parseInt(d['likes_count']);
            let hot = replies + retweets + likes * 0.5;
            console.log(hot)
            return y((Math.pow(hot, 1/4)));
        })
        .attr('r', (d, i) => {
            let replies = parseInt(d['replies_count']);
            let retweets = parseInt(d['retweets_count']);
            let likes = parseInt(d['likes_count']);
            let hot = replies + retweets + likes * 0.5;
            return Math.sqrt(hot + 0.1);
        })
        .style('fill', 'steelblue')
        .attr('opacity', 0.6)
        .on('mouseover', (e, d) => {
            let tweet = d['tweet'];
            let name = d['name'];
            let time = d['created_at'];

            let replies = parseInt(d['replies_count']);
            let retweets = parseInt(d['retweets_count']);
            let likes = parseInt(d['likes_count']);
            
            let content = '<table><tr><td>Author</td><td>' + name + '</td></tr>'
                + '<tr><td>Time</td><td>' + time + '</td></tr>'
                + '<tr><td>Content</td><td>' + tweet + '</td><tr></table>';
            
            let str = d[x_attr];
            
            let tooltip = d3.select('#tooltip');
            tooltip.html(content)
                .style('left', (x(get_time(str)) + 5) + 'px')
                .style('top', (y(parseInt(Math.pow(replies+retweets+likes * 0.5, 1/4))) + 5) + 'px')
                .style('visibility', 'visible');
            // console.log('here')
        })
        .on('mouseout', (e, d) => {
            let tooltip = d3.select('#tooltip');
            tooltip.style('visibility', 'hidden');
        })
}


d3.csv(data_file).then(function (DATA) {
    data = DATA.filter((d, i) => (get_time(d[x_attr]) > -100000000));
    // remove data without x_attr or y_attr
    //data = data.filter((d, i) => (d[x_attr] != '' && d[y_attr] != '' && d[z_attr] != ''))
    //console.log(data)
   // draw_chart2()
    draw_main();
})

