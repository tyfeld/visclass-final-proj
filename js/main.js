let _width = $(window).width()
let _height = $(window).height()
let width0 = 0.98 * _width
let height0 = 0.98 * _height
let width = width0 / 1.1
let height = height0 / 3.2
let fontFamily
let data_file = '../data/VIS2020.csv'
let ua = navigator.userAgent.toLowerCase()
fontFamily = "Khand-Regular"
if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
    fontFamily = "PingFangSC-Regular"
}

//fontFamily = "";
d3.select("body")
    .style("font-family", fontFamily)



// transform type of hashtags from string ro array of string
function process(data) {
    for (var i = 0; i < data.length; ++i) {
        data[i]['hashtags'] = data[i]['hashtags'].substring(1, data[i]['hashtags'].length - 1); //remove '[' and ']'
        data[i]['hashtags'] = data[i]['hashtags'].split(', ') // split the string
        for (var j = 0; j < data[i]['hashtags'].length; ++j) {
            data[i]['hashtags'][j] = data[i]['hashtags'][j].substring(1, data[i]['hashtags'][j].length - 1);
        }
    }
}

function compareFunction(item1, item2) {
    if (item1[1] < item2[1]) return 1;
    else return -1;
}

// from up to bottom, from right to left
function compareFunction2(item1, item2) {
    if (item1[3] > item2[3]) return 1;
    else if (item1[3] < item2[3]) return -1;
    else if (item1[3] === item2[3]) {
        if (item1[2] < item2[2]) return 1;
        else return -1;
    }
}

// extract hashtags information from processed data and calcalute it's x value
// returned hashtags: [['hashtag1', sum1, x1], ['hashtag2', sum2, x2], ...]
function extract(data) {
    filted = 'vis2020'; // the hashtag to be ignored
    hashtags = [[filted, 0, 0]];
    for (d in data) {
        // some auxiliary variables
        let padding = { 'left': 0.1 * width, 'bottom': 0.1 * height, 'top': 0.1 * height, 'right': 0.1 * width }
        let x = d3.scaleLinear()
            .domain(get_x_min_max(data, x_attr))
            .range([padding.left, width - padding.right]);
    
        x_value = x(get_time(data[d][x_attr]));
        tags = data[d]['hashtags'];
        for (t in tags) {
            tag = tags[t];
            if (tag === filted) continue;
            for (var k = 0; k < hashtags.length; ++k) {
                if (hashtags[k][0] === tag) {
                    hashtags[k][1] += 1;
                    hashtags[k][2] += x_value;
                    break;
                }
                if (k === hashtags.length - 1) {
                    var arr = [tag, 0, 0];
                    hashtags.push(arr);
                }
            }
        }
    }
    hashtags.splice(0, 1)
    hashtags.sort(compareFunction); // sort according to sum value
    return hashtags;
}

// calculate the height value of each hashtag
// calculate the x value of each hashtag, according to mean of twitters' x values
// returned hashtags: [['hashtag1', sum1, x1, y1], ['hashtag2', sum2, x2, y2], ...]
function cal_posi(hashtag) {
    top_height = height / 6
    gap_y = height / 10
    max_tags_y = 5; // criteria 1: max num of tags permitted within the same height
    max_gap = 5; // criteria 2: |sum1-sum2| <= max_gap
    max_tags = 25; // max num of tags permiited in total
    hashtag.length = max_tags;

    cnter = 0;
    curr_value = hashtag[0][1];
    curr_height = top_height;

    for (d in hashtag) {
        if (cnter < max_tags_y && curr_value - hashtag[d][1] <= max_gap) {
            cnter += 1;
        }
        else {
            curr_height += gap_y;
            curr_value = hashtag[d][1];
            cnter = 1;
        }

        hashtag[d].push(curr_height);
        hashtag[d][2] = hashtag[d][2] / hashtag[d][1];
    }
}

function process_overlap(hashtag) {
    hashtag.sort(compareFunction2);
    max_x = 150;
    for (h_curr in hashtag) {
        for (h in hashtag) {
            if (parseInt(h) >= parseInt(h_curr)) break;
            while (hashtag[h][3] === hashtag[h_curr][3] && Math.abs(hashtag[h][2] - hashtag[h_curr][2]) <= max_x) {
                hashtag[h_curr][2] -= max_x;
            }
        }
    }
}

function draw_hashtags(hashtags) {
    let chart1 = d3.select('#chart1')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    let text = chart1.append("g")
        .selectAll("text")
        .data(hashtags)
        .join("text")
        .text(d => d[0])
        .attr("x", d => d[2])
        .attr("y", d => d[3])
        .attr("font-family", 'roboto')
        .attr("font-size", d => 18 - (d[3]-50) / 30)
        .attr("stroke", '#CD5968')
        .attr("fill", '#CD5968')
        .attr("cursor", 'pointer')
        // .attr("opacity", 1)
        // .attr("font-weight", 'bold')
}

let x_attr = 'created_at';
let y_attr = 'hot';

function func(x) {
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

function calhot(d){
    let replies = parseInt(d['replies_count']);
    let retweets = parseInt(d['retweets_count']);
    let likes = parseInt(d['likes_count']);
    return replies + retweets + likes * 0.3;
}

function get_y_min_max(data) {
    let min = 1e9;
    let max = 0;
    data.forEach(d => {
        let v = calhot(d);
        if (v > max) max = v;
        if (v < min) min = v;
    });
    return [min, max];
}

function draw_main() {
    let padding = { 'left': 0.1 * width, 'bottom': 0.1 * height, 'top': 0.1 * height, 'right': 0.1 * width };
    let chart2 = d3.select('#chart2')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    chart2.append('g')
        .attr('transform', `translate(${padding.left + (width - padding.left - padding.right) / 2}, ${padding.top})`)

    let x = d3.scaleLinear()
        .domain(get_x_min_max(data, x_attr))
        .range([padding.left, width - padding.right]);
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d => d);

    let y = d3.scaleLinear()
        .domain(get_y_min_max(data))
        .range([height - padding.bottom, padding.top]);
    let axis_y = d3.axisLeft()
        .scale(y)
        .ticks(10)
        .tickFormat(d => d);

    // x axis
    chart2.append('g')
        .attr('transform', `translate(${0}, ${height - padding.bottom})`)
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.4rem');

    chart2.append('g')
        .attr('transform', `translate(${padding.left + (width - padding.left - padding.right) / 2}, ${height - padding.bottom})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dx', '-0.4rem')
        .attr('dy', 0.08 * height)
        .text('time');

    // y axis
    chart2.append('g')
        .attr('transform', `translate(${padding.left}, ${0})`)
        .call(axis_y)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.4rem');

    chart2.append('g')
        .attr('transform', `translate(${padding.left}, ${height / 2})
                rotate(-90)`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dy', -height * 0.12)
        .text(y_attr)

    // points
    chart2.append('g')
        .selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('class', 'point')
        .attr('cx', (d, i) => {
            let str = d[x_attr];
            // console.log(str)
            // console.log(get_time(str))
            return x(get_time(str));
        })
        .attr('cy', (d, i) => {
            // console.log(hot)
            return y(calhot(d));
        })
        .attr('r', (d, i) => {
            return Math.sqrt(calhot(d));
        })
        .style('fill', '#62A55E')
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
                .style('top', (y(parseInt(Math.pow(replies + retweets + likes * 0.5, 1 / 4))) + 5) + 'px')
                .style('visibility', 'visible');
            // console.log('here')
        })
        .on('mouseout', (e, d) => {
            let tooltip = d3.select('#tooltip');
            tooltip.style('visibility', 'hidden');
        })
}

let chart3 = d3
    .select("#chart3")
    .append("svg")
    .attr('width', width)
    .attr('height', height)


function draw_chart3(){
    let padding = { 'left': 0.1 * width, 'bottom': 0.1 * height, 'top': 0.1 * height, 'right': 0.1 * width }
    let x = d3.scaleLinear()
        .domain([54093518, 73058983])
        .range([padding.left, width - padding.right])
    let y = d3.scaleLinear()
        .domain([2031,65000])
        .range([height - padding.bottom, padding.top])
    let z = d3.scaleLinear()
        .domain([2031,65000])
        .range([5,15])
    chart3.append('g')
        .selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('class', 'point')
        .attr('cx', (d, i) => {
            //console.log('data', d); 
            return x(parseInt(d["Time"]))
        })
        .style("opacity", 0.7)
        .attr('cy', (d, i) => y(parseInt(d["Followers"])))
        //.attr('r', 3)
        .attr('r', (d, i) => z(parseInt(d["Followers"])))
        .attr('fill', '#3488BC')
        .on('mouseover', (e, d) => {
            // // show a tooltip
            // let name = d['First Name'] + ' ' + d['Mid Name'] + ' ' + d['Last Name']
            // let institution = d['Institution']
            // let grad_year = d['Ph.D. Graduation Year']
            // let grad_school = d['Ph.D. Graduate School']
            // let pubs = d['Publications']
            // let hin = d[z_attr]
            // let intes = d["Research Interest"]
            // let content = name + ', ' + institution + '<br>' + 'Graduated in ' + grad_school + ' at '
            //     + grad_year + '<br>Research Interest: ' + intes + '<br>Publications: ' + pubs + '<br>'
            //     + 'H-index: ' + hin
            // // tooltip
            // let tooltip = d3.select('#tooltip')
            // tooltip.html(content)
            //     .style('left', (x(parseInt(d[x_attr])) + 15) + 'px')
            //     .style('top', (y(parseInt(d[y_attr])) + 5) + 'px')
            //     .style('visibility', 'visible')
            //.transition().duration(500)

            //fading
            //fading(institution)
            //console.log(d)
            //console.log(padding.left)
        })
}


d3.csv(data_file).then(function (DATA) {
    data = DATA.filter((d, i) => (get_time(d[x_attr]) > -100000000));
    process(data);
    hashtags = extract(data);
    cal_posi(hashtags);
    process_overlap(hashtags);
    draw_hashtags(hashtags);
    draw_main();
    //draw_chart3();
})

d3.csv("../data/Follow.csv").then(function(DATA){
    data = DATA.filter((d,i) => d["Time"] > 0);
    //console.log(data);
    draw_chart3();
})