// initialize data 
let _width = $(window).width()
let _height = $(window).height()
let width0 = 0.98 * _width
let height0 = 0.98 * _height
let width = width0 / 1.1
let height = height0 / 3.3
let fontFamily
let data_file = '../data/VIS2020.csv'
let ua = navigator.userAgent.toLowerCase()
fontFamily = "roboto"
if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
    fontFamily = "PingFangSC-Regular"
}

let  meeting_text=[[0, 0, "2020-04-20"], [0, 1, "Paper"], [0, 2, "submission"], [0, 3, "deadline"],
[1, 0, "2020-07-08"], [1, 1, "Author"], [1, 2, "notification"], [1, 3, "deadline"],
[2, 0, "2020-10-25"], [2, 1, "VIS2020"], [2, 2, "Conference"],
[3, 0, "2020-10-30"]]
let Cz = 2 * height0 / 1000
let DATA_xpos = [723, 770, 117, 782, 80, 80, 807, 699, 740, 259, 650, 959, 504, 572, 589, 539, 955, 244, 482, 72, 505, 382, 51, 763, 943, 882]
let username_y = 0.7
let tag_opacity = [0.3, 0.7, 0.9]
let tweet_opacity = [0.2, 0.7, 0.9]
let user_opacity = [0.3, 0.7, 0.9]

let datahash = {}
let iid = 0

let padding;
let x;
let x_t;
let y;

var clickTimeId
let clickTimeDelay = 200

let x_attr = 'created_at'
let y_attr = 'hot'


// select chart 1, 2, 3, 4
d3.select("body")
    .style("font-family", fontFamily)

let title = d3.select('#title')
    .append('svg')
    .attr('width', width0)
    .attr('height', height0 * 0.06)

let chart1 = d3.select('#chart1')
    .append('svg')
    .attr('width', width0)
    .attr('height', height)

let chart2 = d3.select('#chart2')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

let chart3 = d3.select("#chart3")
    .append("svg")
    .attr('width', width)
    .attr('height', height + 40)

let chart4 = d3.select('#chart4')
    .append('svg')
    .attr('width', width0)
    .attr('height', height)
    .attr('overflow', 'visible')


// click tag to highlight
let ttag = 'null'

function highlightTag(tag) {
    chart1.selectAll("text")
        .transition()
        .duration(500)
        .attr("font-size", d => 18 - (d[3] - 50) / 30)
        .attr('opacity', tag_opacity[0])
    chart1.selectAll("text")
        .filter(d => d[0] == tag)
        .transition()
        .duration(500)
        .attr("font-size", d => (18 - (d[3] - 50) / 30) * 1.5)
        .attr('opacity', tag_opacity[2])

    users = []
    let min_x = Date.now();
    let max_x = new Date(1970, 1, 1);
    // 确定时间轴范围
    chart2.selectAll('circle')
        .filter((d, i) => {
            ddd = d['hashtags']
            for (dd in ddd) {
                if (ddd[dd] == tag) {
                    if (d[x_attr] < min_x) min_x = d[x_attr]
                    if (d[x_attr] > max_x) max_x = d[x_attr]
                }
            }
        })
    // 修改坐标轴
    x = d3.scaleTime()
        .domain([min_x, max_x])
        .range([padding.left, width - padding.right])
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d3.timeFormat('%m-%d'))
    chart2.select('.x_axis').remove();
    chart2.append('g')
        .attr('class', 'x_axis')
        .attr('transform', `translate(${0}, ${height - padding.bottom})`)
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.4rem')
    // 筛选出时间范围内的点
    chart2.selectAll('circle')
        .transition()
        .duration(500)
        .style('visibility', (d, i) => {
            let x_p = x(d[x_attr])
            if (x_p < padding.left || x_p > width - padding.left) {
                return 'hidden'
            }
            else return 'visible'
        })
        .attr('r', (d, i) => {
            return Math.sqrt(calhot(d) / 2)
        })
        .attr('cx', (d, i) => {
            return x(d[x_attr])
        })
        .attr('cy', (d, i) => {
            return y(calhot(d))
        })
        .attr('opacity', tweet_opacity[0])
    // 更改透明度
    chart2.selectAll('circle')
        .filter(function (d, i) {
            ddd = d['hashtags']
            for (dd in ddd) {
                if (ddd[dd] == tag) {
                    users.push(d['username'])
                    return true
                }
            }
            return false
        })
        .transition()
        .duration(500)
        .attr('r', (d, i) => {
            return 2 + Math.sqrt(calhot(d) * 3)
        })
        .attr('opacity', tweet_opacity[2])

    let z = d3.scaleLinear()
        .domain([2031, 65000])
        .range([15, 25])
    chart3.selectAll("image")
        .transition()
        .duration(500)
        .style("opacity", user_opacity[0])
        .attr('width', (d, i) => z(parseInt(d["Followers"])))
        .attr('height', (d, i) => z(parseInt(d["Followers"])))
        .attr('visible', 'hidden')
    chart3.selectAll("image")
        .filter((d, i) => {
            for (usr in users) {
                if (d['Username'] == users[usr]) {
                    return true
                }
            }
        })
        .transition()
        .duration(500)
        .style("opacity", user_opacity[2])
        .attr('width', (d, i) => z(parseInt(d["Followers"])) * 3)
        .attr('height', (d, i) => z(parseInt(d["Followers"])) * 3)
}

function selectTag(tag) {
    reset()
    if (tag == ttag) {
        ttag = 'null'
    }
    else {
        highlightTag(tag)
        ttag = tag
    }
}


// click tweet to highlight
function highlightTweet(id, usn, htgs) {
    chart1.selectAll("text")
        .transition()
        .duration(500)
        .attr("font-size", d => 18 - (d[3] - 50) / 30)
        .attr('opacity', tag_opacity[0])
    chart1.selectAll("text")
        .filter(function (d, i) {
            for (ht in htgs) {
                // console.log(htgs)
                if (d[0] == htgs[ht]) {
                    console.log(d)
                    return true
                }
            }
            return false
        })
        .transition()
        .duration(500)
        .attr("font-size", d => (18 - (d[3] - 50) / 30) * 1.5)
        .attr('opacity', tag_opacity[2])
        
    chart2.selectAll('circle')
        .transition()
        .duration(500)
        .attr('r', (d, i) => {
            return Math.sqrt(calhot(d) / 2)
        })
        .attr('opacity', tweet_opacity[0])
    chart2.selectAll('circle')
        .filter(d => d['id'] == id)
        .transition()
        .duration(500)
        .attr('r', (d, i) => {
            return 2 + Math.sqrt(calhot(d) * 3)
        })
        .attr('opacity', tweet_opacity[2])

    let z = d3.scaleLinear()
        .domain([2031, 65000])
        .range([15, 25])
    chart3.selectAll("image")
        .transition()
        .duration(500)
        .style("opacity", user_opacity[0])
        .attr('width', (d, i) => z(parseInt(d["Followers"])))
        .attr('height', (d, i) => z(parseInt(d["Followers"])))
        .attr('visible', 'hidden')
    chart3.selectAll("image")
        .filter((d, i) => d["Username"] == usn)
        .transition()
        .duration(500)
        .style("opacity", user_opacity[2])
        .attr('width', (d, i) => z(parseInt(d["Followers"])) * 3)
        .attr('height', (d, i) => z(parseInt(d["Followers"])) * 3)
}

function selectTweet(id, usn, htgs) {
    reset()
    if (id == iid) {
        iid = 0
    }
    else {
        highlightTweet(id, usn, htgs)
        iid = id
    }
}


// click user to highlight
function highlightUser(user) {
    let z = d3.scaleLinear()
        .domain([2031, 65000])
        .range([15, 25])
    chart3.selectAll("image")
        .transition()
        .duration(500)
        .style("opacity", user_opacity[0])
        .attr('width', (d, i) => z(parseInt(d["Followers"])))
        .attr('height', (d, i) => z(parseInt(d["Followers"])))
    chart3.selectAll("image")
        .filter((d, i) => d["Username"] == user)
        .transition()
        .duration(500)
        .style("opacity", user_opacity[2])
        .attr('width', (d, i) => 3 * z(parseInt(d["Followers"])))
        .attr('height', (d, i) => 3 * z(parseInt(d["Followers"])))

    let htgs = []
    let min_x = Date.now();
    let max_x = new Date(1970, 1, 1);

    // 先确定横轴范围
    chart2.selectAll('circle')
        .filter(function (d, i) {
            if (d['username'] == user) {
                for (ht in d['hashtags']) {
                    if (d['hashtags'][ht] != 'vis2020') {
                        htgs.push(d['hashtags'][ht])
                        if (d[x_attr] < min_x)
                            min_x = d[x_attr]
                        if (d[x_attr] > max_x)
                            max_x = d[x_attr]
                    }
                }
                return true
            }
            else return false
        })

    // 修改坐标轴
    x = d3.scaleTime()
        .domain([min_x, max_x])
        .range([padding.left, width - padding.right])
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d3.timeFormat('%m-%d'))
    chart2.select('.x_axis').remove();
    chart2.append('g')
        .attr('class', 'x_axis')
        .attr('transform', `translate(${0}, ${height - padding.bottom})`)
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.4rem')

    // 筛选出时间范围内的点
    chart2.selectAll('circle')
        .transition()
        .duration(500)
        .style('visibility', (d, i) => {
            let x_p = x(d[x_attr])
            if (x_p < padding.left || x_p > (width - padding.right))
                return 'hidden'
            else return 'visible'
        })
        .attr('r', (d, i) => {
            return Math.sqrt(calhot(d) / 2)
        })
        .attr('cx', (d, i) => {
            return x(d[x_attr])
        })
        .attr('cy', (d, i) => {
            return y(calhot(d))
        })
        .attr('opacity', tweet_opacity[0])

    // 修改透明度
    chart2.selectAll('circle')
        .filter(function (d, i) {
            if (d['username'] == user) {
                return true
            }
            else return false
        })
        .transition()
        .duration(500)
        .attr('r', (d, i) => {
            return 2 + Math.sqrt(calhot(d) * 3)
        })
        .attr('opacity', tweet_opacity[2])

    chart1.selectAll("text")
        .transition()
        .duration(500)
        .attr("font-size", d => 18 - (d[3] - 50) / 30)
        .attr('opacity', tag_opacity[0])
    chart1.selectAll("text")
        .filter(function (d, i) {
            for (ht in htgs) {
                if (d[0] == htgs[ht]) {
                    return true
                }
            }
            return false
        })
        .transition()
        .duration(500)
        .attr("font-size", d => (18 - (d[3] - 50) / 30) * 1.5)
        .attr('opacity', tag_opacity[2])
}

let uuser = 'skipher' // 表示目前没有user被选中

function selectUser(user) {
    reset()
    if (user == uuser) { // 重新点击这个用户的头像可以取消筛选
        uuser = 'skipher'
    }
    else {
        highlightUser(user)
        uuser = user
    }
}


// remove selection
function reset() {
    chart1.selectAll("text")
        .transition()
        .duration(500)
        .attr("font-size", d => 18 - (d[3] - 50) / 30)
        .attr('opacity', tag_opacity[1])

    x = d3.scaleTime()
        .domain(get_x_min_max(data, x_attr))
        .range([padding.left, width - padding.right])
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d3.timeFormat('%m-%d'))
    chart2.select('.x_axis').remove()
    chart2.append('g')
        .attr('class', 'x_axis')
        .attr('transform', `translate(${0}, ${height - padding.bottom})`)
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.4rem')
    chart2.selectAll('circle')
        .transition()
        .duration(500)
        .style('visibility', (d, i) => {
            let x_p = x(d[x_attr])
            if (x_p < padding.left || x_p > (width - padding.right))
                return 'hidden'
            else return 'visible'
        })
        .attr('class', 'point')
        .attr('visibility', 'visible')
        .attr('cx', (d, i) => {
            return x(d[x_attr])
        })
        .attr('cy', (d, i) => {
            return y(calhot(d))
        })
        .attr('r', (d, i) => {
            return 2 + Math.sqrt(calhot(d))
        })
        .attr('opacity', tweet_opacity[1])

    let z = d3.scaleLinear()
        .domain([2031, 65000])
        .range([15, 25])
    chart3.selectAll('image')
        .transition()
        .duration(500)
        .style("opacity", user_opacity[1])
        .attr('width', (d, i) => 2 * z(parseInt(d["Followers"])))
        .attr('height', (d, i) => 2 * z(parseInt(d["Followers"])))
}

// transform type of data['hashtags'] from string ro array of string
// transform type of data['created_at'] from string to date
function process(data) {
    for (var i = 0; i < data.length; ++i) {
        var str = data[i]['created_at'];
        str = str.substring(0, 10) + 'T' + str.substring(11, 19);
        data[i]['created_at'] = Date.parse(str);

        data[i]['hashtags'] = data[i]['hashtags'].substring(1, data[i]['hashtags'].length - 1) //remove '[' and ']'
        data[i]['hashtags'] = data[i]['hashtags'].split(', ') // split the string
        for (var j = 0; j < data[i]['hashtags'].length; ++j) {
            data[i]['hashtags'][j] = data[i]['hashtags'][j].substring(1, data[i]['hashtags'][j].length - 1)
        }
    }
}

function compareFunction(item1, item2) {
    if (item1[1] < item2[1]) return 1
    else return -1
}

// from up to bottom, from right to left
function compareFunction2(item1, item2) {
    if (item1[3] > item2[3]) return 1
    else if (item1[3] < item2[3]) return -1
    else if (item1[3] === item2[3]) {
        if (item1[2] < item2[2]) return 1
        else return -1
    }
}

// extract hashtags information from processed data and calcalute it's x value
// returned hashtags: [['hashtag1', sum1, x1], ['hashtag2', sum2, x2], ...]
function extract(data) {
    filted = 'vis2020' // the hashtag to be ignored
    hashtags = [[filted, 0, 0]]
    for (d in data) {
        // some auxiliary variables
        let padding = { 'left': 0.2 * width, 'bottom': 0.05 * height, 'top': 0.1 * height, 'right': 0.1 * width }
        let x = d3.scaleLinear()
            .domain(get_x_min_max(data, x_attr))
            .range([padding.left, width - padding.right])

        x_value = x(data[d][x_attr])
        tags = data[d]['hashtags']
        for (t in tags) {
            tag = tags[t]
            if (tag === filted) continue
            for (var k = 0; k < hashtags.length; ++k) {
                if (hashtags[k][0] === tag) {
                    hashtags[k][1] += 1
                    hashtags[k][2] += x_value
                    break
                }
                if (k === hashtags.length - 1) {
                    var arr = [tag, 0, 0]
                    hashtags.push(arr)
                }
            }
        }
    }
    hashtags.splice(0, 1)
    hashtags.sort(compareFunction) // sort according to sum value
    return hashtags
}

// calculate the height value of each hashtag
// calculate the x value of each hashtag, according to mean of twitters' x values
// returned hashtags: [['hashtag1', sum1, x1, y1], ['hashtag2', sum2, x2, y2], ...]
function cal_posi(hashtag) {
    top_height = height / 6
    gap_y = height / 10
    max_tags_y = 5 // criteria 1: max num of tags permitted within the same height
    max_gap = 5 // criteria 2: |sum1-sum2| <= max_gap
    max_tags = 25 // max num of tags permiited in total
    hashtag.length = max_tags

    cnter = 0
    curr_value = hashtag[0][1]
    curr_height = top_height

    for (d in hashtag) {
        if (cnter < max_tags_y && curr_value - hashtag[d][1] <= max_gap) {
            cnter += 1
        }
        else {
            curr_height += gap_y
            curr_value = hashtag[d][1]
            cnter = 1
        }

        hashtag[d].push(curr_height)
        hashtag[d][2] = hashtag[d][2] / hashtag[d][1]
    }
}

function process_overlap(hashtag) {
    hashtag.sort(compareFunction2)
    gapx = width / 11
    for (h_curr in hashtag) {
        for (h in hashtag) {
            if (parseInt(h) >= parseInt(h_curr)) break
            while (hashtag[h][3] === hashtag[h_curr][3] && Math.abs(hashtag[h][2] - hashtag[h_curr][2]) <= gapx) {
                hashtag[h_curr][2] -= gapx
            }
            hashtag[h_curr][2] = Math.max(hashtag[h_curr][2], 10)
        }
    }
}


// tag chart
function draw_hashtags(hashtags) {
    chart1.append("g")
        .selectAll("text")
        .data(hashtags)
        .join("text")
        .text(d => ('🏷️' + d[0]))
        .attr("x", function(d){
            if (d[0] == 'islandlife') return d[2] + height0 / 10
            else return d[2]
        })
        .attr("y", d => d[3])
        .attr("font-family", 'roboto')
        .attr("font-size", d => 18 - (d[3] - 50) / 30)
        .attr("stroke", '#CD5968')
        .attr("fill", '#CD5968')
        .attr("cursor", 'pointer')
        .attr('opacity', tag_opacity[1])
        .on('click', function (d, i) {
            selectTag(i[0])
        })

    title.append('g')
        .attr('transform', `translate(${width / 2 - 100}, ${height / 10 + 10})`)
        .append('text')
        .attr("font-family", 'roboto')
        .attr("font-size", d => 18)
        .attr("stroke", '#CD5968')
        .attr("fill", '#CD5968')
        .text('A Visualization for twitters about the VIS2020')

    title.append('image')
        .attr('xlink:href', "../data/icon.png")
        .attr('x', width0 * 0.95)
        .attr('y', 0)
        .attr('width', 40)
        .attr('weight', 40)
}


// get range
function get_x_min_max(data, attr) {
    let min = Date.now()
    let max = new Date(1970, 1, 1)
    data.forEach(d => {
        let dat = d[attr]
        if (dat > max)
            max = dat
        if (dat < min)
            min = dat
    })
    return [min, max]
}

function get_y_min_max(data) {
    let min = 1e9
    let max = 0
    data.forEach(d => {
        let v = calhot(d)
        if (v > max) max = v
        if (v < min) min = v
    })
    return [min, max]
}


// hot = replies + retweets + likes * 0.3
function calhot(d) {
    let replies = parseInt(d['replies_count'])
    let retweets = parseInt(d['retweets_count'])
    let likes = parseInt(d['likes_count'])
    return replies + retweets + likes * 0.3
}



// zoom function
function zoomed(event) {
    clearTimeout(clickTimeId)
    x = event.transform.rescaleX(x_t);
    update();
}

function update() {
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d3.timeFormat("%m-%d"));

    // x axis
    chart2.select('.x_axis').remove();
    chart2.append('g')
        .attr('class', 'x_axis')
        .attr('transform', `translate(${0}, ${height - padding.bottom})`)
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.4rem')

    // points
    let points = chart2.selectAll('.point')
        .data(data);


    points.enter().append('circle')
        .attr('class', 'point')
        .merge(points)
        .attr('cx', (d, i) => {
            return x(d[x_attr]);
        })
        .attr('cy', (d, i) => y(calhot(d)))
        .style('visibility', (d, i) => {
            let x_p = x(d[x_attr])
            if (x_p < padding.left || x_p > (width - padding.right))
                return 'hidden'
            else return 'visible'
        })
    points.exit().remove();
}

// tweet chart
function draw_chart2() {
    padding = { 'left': 0.2 * width, 'bottom': 0.1 * height, 'top': 0.05 * height, 'right': 0.2 * width }

    chart2.append('g')
        .attr('transform', `translate(${padding.left + (width - padding.left - padding.right) / 2}, ${padding.top})`)

    x_t = d3.scaleTime()
        .domain(get_x_min_max(data, x_attr))
        .range([padding.left, width - padding.right])
    x = x_t;
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d3.timeFormat("%m-%d"))

    y = d3.scalePow()
        .exponent(0.5)
        .domain(get_y_min_max(data))
        .range([height - padding.bottom, padding.top])
    let axis_y = d3.axisLeft()
        .scale(y)
        .ticks(10)
        .tickFormat(d => d)

    // x axis
    chart2.append('g')
        .attr('class', 'x_axis')
        .attr('transform', `translate(${0}, ${height - padding.bottom})`)
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.4rem')

    // y axis
    chart2.append('g')
        .attr('transform', `translate(${padding.left}, ${0})`)
        .call(axis_y)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.4rem')

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
            return x(d[x_attr])
        })
        .attr('cy', (d, i) => {
            // console.log(hot)
            return y(calhot(d))
        })
        .attr('r', (d, i) => {
            return 2 + Math.sqrt(calhot(d))
        })
        .style('fill', (d, i) => {
            let date1 = Date.parse("2020-04-20")
            let date2 = Date.parse("2020-07-08")
            let date3 = Date.parse("2020-10-25")
            let date4 = Date.parse("2020-10-30")
            let date = Date.parse(d['date'])
            if (date < date1 || (date > date2 && date < date3) || (date > date4)) return "#377eb8"
            else return "#4daf4a"
        })
        .attr('opacity', tweet_opacity[1])
        .on('click', function (e, d) {
            clearTimeout(clickTimeId)
            clickTimeId = setTimeout(function() {
              selectTweet(d['id'], d['username'], d['hashtags'])
            }, clickTimeDelay)
        })
        .on('mouseover', (e, d) => {
            let tweet = d['tweet'];
            let name = d['name'];
            let date = d['date'];
            let clock = d['time'];
            let time = date + ' ' + clock;

            let replies = parseInt(d['replies_count'])
            let retweets = parseInt(d['retweets_count'])
            let likes = parseInt(d['likes_count'])

            let content = '<span style="font-size:0.8rem">' + name + '</span>' + '<br>'
                + '<span style="font-size:0.3rem">' + time + '</span>'
                + '<br>' + '<div style="font-size:0.6rem">' + tweet + '</div>'
                + '<p align = "right" style="font-size:0.5rem">' + '👍 ' + likes + '    💬 ' + replies + '</p>'

            let tooltip = d3.select('#tooltip')
            tooltip.html(content)
                .style('left', (width * 0.83) + 'px')
                .style('top', (y(0) + 50) + 'px')
                .style('visibility', 'visible')
        })
        .on('mouseout', (e, d) => {
            let tooltip = d3.select('#tooltip')
            tooltip.style('visibility', 'hidden')
        })

    let extent = [[padding.left, padding.top], [width - padding.right, height - padding.bottom]]
    chart2.call(d3.zoom()
        .scaleExtent([1, 7])
        .translateExtent(extent)
        .extent(extent)
        .on('zoom', zoomed))
        // .on("dblclick.zoom", null);
}



// user chart
function draw_chart3() {

    var num = 26
    var xpos = DATA_xpos

    let padding = { 'left': 0.2 * width, 'bottom': 0.1 * height, 'top': 0.05 * height, 'right': 0.1 * width }
    let x = d3.scaleLinear()
        .domain([54093518, 73058983])
        .range([padding.left, width - padding.right])
    let y = d3.scaleLinear()
        .domain([0, d3.max(xpos, function (d) {
            return d
        })])
        .range([height - padding.bottom, padding.top])
    let z = d3.scaleLinear()
        .domain([2031, 65000])
        .range([15, 25])

    var images = chart3.selectAll(".images")
        .data(data2)
        .enter()
        .append("image")

    images.attr("xlink:href", function (d) {
        return "../img/" + d["Username"] + ".jpg"
    })
        .attr('x', (d, i) => {
            return x(parseInt(d["Time"]))
        })
        .attr('y', function (d, i) {
            return y(xpos[parseInt(d["Index"]) - 1])
        })
        .attr("width", (d, i) => 2 * z(parseInt(d["Followers"])))
        .attr("height", (d, i) => 2 * z(parseInt(d["Followers"])))
        .style("opacity", user_opacity[1])
        .on('click', function (e, d) {
            selectUser(d['Username'])
        })
        .on('mouseover', (e, d) => {
            let name = d['Name']

            let content = '<span style="font-size:0.6rem">' + name + '</span>' + '<br>'

            let tooltip = d3.select('#tooltip1');
            tooltip.html(content)
                .style('left', x(parseInt(d["Time"])) + 'px')
                .style('top', y(xpos[parseInt(d["Index"]) - 1]) - username_y * height0 + 'px')
                .style('visibility', 'visible');
        })
        .on('mouseout', (e, d) => {
            let tooltip = d3.select('#tooltip1');
            tooltip.style('visibility', 'hidden');
        })

}



// meeting line chart
function draw_chart4() {
    let x0 = padding.left * 0.45
    let y0 = - 0.9 * _height
    let gap_y = _height * 0.15
    let r = 3

    let circles_y = [0, 1, 2, 3, 4, 5]
    for (d in circles_y) {
        circles_y[d] = y0 + circles_y[d] * gap_y
    }
    let vertical_lines = [0, 1, 2, 3, 4]
    for (d in vertical_lines) {
        let y1 = circles_y[d] + r / 2
        let y2 = y1 + gap_y - r
        let pos = { 'y1': y1, 'y2': y2 }
        vertical_lines[d] = pos
    }
    let hor_lines = [1, 2, 3, 4]
    let hor_length = padding.left * 0.3
    let text = meeting_text

    chart4.append('g')
        .selectAll('circle')
        .data(circles_y)
        .join('circle')
        .attr('cx', x0)
        .attr('cy', d => d)
        .attr('r', r)
        .attr('fill', 'white')
        .attr('stroke', 'black')

    chart4.append('g')
        .selectAll('line')
        .data(vertical_lines)
        .join('line')
        .attr('x1', x0)
        .attr('y1', d => d.y1)
        .attr('x2', x0)
        .attr('y2', d => d.y2)
        .attr('stroke-width', 2)
        .attr('stroke', (d, i) => {
            if (i % 2 === 0) return '#377eb8'
            else return '#4daf4a'
        })

    chart4.append('g')
        .selectAll('line')
        .data(hor_lines)
        .join('line')
        .attr('x1', (d, i) => {
            if (i % 2 === 0) return x0
            else return x0 - hor_length
        })
        .attr('x2', (d, i) => {
            if (i % 2 === 0) return x0 + hor_length
            else return x0
        })
        .attr('y1', d => circles_y[d])
        .attr('y2', d => circles_y[d])
        .attr('stroke-width', 2)
        .attr('stroke', (d, i) => {
            if (i % 2 === 1) return '#377eb8'
            else return '#4daf4a'
        })

    chart4.append('g')
        .selectAll('text')
        .data(text)
        .join('text')
        .attr('x', (d, i) => {
            if (d[0] % 2 === 0) return x0 + 10
            else return x0 + 10 - hor_length
        })
        .attr('y', (d, i) => {
            let y = circles_y[d[0] + 1] + 15
            y += d[1] * 15
            return y
        })
        .text(d => d[2])
}


// main
d3.csv(data_file).then(function (DATA) {
    data = DATA
    process(data)
    data = data.filter((d, i) => (d[x_attr] > new Date(2020, 1, 1)))
    hashtags = extract(data)
    cal_posi(hashtags)
    process_overlap(hashtags)
    draw_hashtags(hashtags)
    draw_chart2()
    draw_chart4()
})

d3.csv("../data/Follow.csv").then(function (DATA) {
    data2 = DATA.filter((d, i) => d["Time"] > 0)
    draw_chart3()
})