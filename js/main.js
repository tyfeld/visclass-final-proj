// test-push
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

let datahash = {}
let iid = 0

let padding;
let x;
let x_t;
let y;

//fontFamily = "";
d3.select("body")
    .style("font-family", fontFamily)

let title = d3.select('#title')
    .append('svg')
    .attr('width', width)
    .attr('height', height0 * 0.06)

let chart1 = d3.select('#chart1')
    .append('svg')
    .attr('width', width0)
    .attr('height', height)

let chart2 = d3.select('#chart2')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

let chart3 = d3
    .select("#chart3")
    .append("svg")
    .attr('width', width)
    .attr('height', height + 40)

let ttag = 'null'

function highlightTag(tag) {
    chart1.selectAll("text")
        .transition()
        .duration(500)
        .attr("font-size", d => 18 - (d[3] - 50) / 30)
        .attr('opacity', 0.3)
    chart1.selectAll("text")
        .filter(d => d[0] == tag)
        .transition()
        .duration(500)
        .attr("font-size", d => (18 - (d[3] - 50) / 30) * 1.5)
        .attr('opacity', 0.9)
    chart2.selectAll('circle')
        .transition()
        .duration(500)
        .attr('r', (d, i) => {
            return Math.sqrt(calhot(d) / 2)
        })
        .attr('opacity', 0.2)
    chart2.selectAll('circle')
        .filter(function (d, i) {
            ddd = d['hashtags']
            for (dd in ddd) {
                if (ddd[dd] == tag) return true
            }
            return false
        })
        .transition()
        .duration(500)
        .attr('r', (d, i) => {
            return Math.sqrt(calhot(d) * 3)
        })
        .attr('opacity', 0.9)
}


function highlightTweet(id, usn, htgs) {
    chart1.selectAll("text")
        .transition()
        .duration(500)
        .attr("font-size", d => 18 - (d[3] - 50) / 30)
        .attr('opacity', 0.3)
    chart1.selectAll("text")
        .filter(function (d, i) {
            for (ht in htgs) {
                //console.log(ht)
                if (d[0] == htgs[ht]) {
                    console.log("yes")
                    return true
                }
            }
            return false
        })
        .transition()
        .duration(500)
        .attr("font-size", d => (18 - (d[3] - 50) / 30) * 1.5)
        .attr('opacity', 0.9)
    chart2.selectAll('circle')
        .transition()
        .duration(500)
        .attr('r', (d, i) => {
            return Math.sqrt(calhot(d) / 2)
        })
        .attr('opacity', 0.2)
    chart2.selectAll('circle')
        // .filter(function(d, i){
        //     ddd = d['hashtags']
        //     for (dd in ddd){
        //         if (ddd[dd] == tag) return true
        //     }
        //     return false
        // })
        .filter(d => d['id'] == id)
        .transition()
        .duration(500)
        .attr('r', (d, i) => {
            return Math.sqrt(calhot(d) * 3)
        })
        .attr('opacity', 0.9)
    let z = d3.scaleLinear()
        .domain([2031, 65000])
        .range([15, 25])
    chart3.selectAll("image")
        //.transition()
        //.duration(500)
        .style("opacity", 0.3)
        .attr('width', (d, i) => z(parseInt(d["Followers"])))
        .attr('height', (d, i) => z(parseInt(d["Followers"])))
        .attr('visible', 'hidden')
    chart3.selectAll(".image")
        .filter((d, i) => d["Username"] == usn)
        //.transition()
        //.duration(500)
        .style("opacity", 0.9)
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
function reset() {
    chart1.selectAll("text")
        .transition()
        .duration(500)
        .attr("font-size", d => 18 - (d[3] - 50) / 30)
        .attr('opacity', 0.7)
    chart2.selectAll('circle')
        .transition()
        .duration(500)
        .attr('r', (d, i) => {
            return Math.sqrt(calhot(d))
        })
        .attr('opacity', 0.7)
    let z = d3.scaleLinear()
        .domain([2031, 65000])
        .range([15, 25])
    chart3.selectAll('image')
        .transition()
        .duration(500)
        .style("opacity", 0.7)
        .attr('width', (d, i) => 2 * z(parseInt(d["Followers"])))
        .attr('height', (d, i) => 2 * z(parseInt(d["Followers"])))
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

function highlightUser(user) {
    let z = d3.scaleLinear()
        .domain([2031, 65000])
        .range([15, 25])
    chart3.selectAll("image")
        .transition()
        .duration(500)
        .style("opacity", 0.3)
        .attr('width', (d, i) => z(parseInt(d["Followers"])))
        .attr('height', (d, i) => z(parseInt(d["Followers"])))
    chart3.selectAll("image")
        .filter((d, i) => d["Username"] == user)
        .transition()
        .duration(500)
        .style("opacity", 0.9)
        .attr('width', (d, i) => 3 * z(parseInt(d["Followers"])))
        .attr('height', (d, i) => 3 * z(parseInt(d["Followers"])))
    chart2.selectAll('circle')
        .transition()
        .duration(500)
        .attr('r', (d, i) => {
            return Math.sqrt(calhot(d) / 2)
        })
        .attr('opacity', 0.2)
    chart2.selectAll('circle')
        .filter(function (d, i) {
            return d['username'] == user
        })
        .transition()
        .duration(500)
        .attr('r', (d, i) => {
            return Math.sqrt(calhot(d) * 3)
        })
        .attr('opacity', 0.9)
}

let uuser = 'qpvnswruascbqjsx'

function selectUser(user) {
    reset()
    if (user == uuser) {
        uuser = 'qpvnswruascbqjsx'
    }
    else {
        highlightUser(user)
        uuser = user
    }
}

// transform type of hashtags from string ro array of string
function process(data) {
    for (var i = 0; i < data.length; ++i) {
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

        x_value = x(get_time(data[d][x_attr]))
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

function draw_hashtags(hashtags) {
    //datahash = hashtags
    //console.log(datahash)
    chart1.append("g")
        .selectAll("text")
        .data(hashtags)
        .join("text")
        .text(d => ('🏷️' + d[0]))
        .attr("x", d => d[2])
        .attr("y", d => d[3])
        .attr("font-family", 'roboto')
        .attr("font-size", d => 18 - (d[3] - 50) / 30)
        .attr("stroke", '#CD5968')
        .attr("fill", '#CD5968')
        .attr("cursor", 'pointer')
        .attr('opacity', 0.7)
        .on('click', function (d, i) {
            selectTag(i[0])
        })
    title.append('g')
        .attr('transform', `translate(${width / 2 - 100}, ${height / 10})`)
        .append('text')
        .attr("font-family", 'roboto')
        .attr("font-size", d => 18)
        .attr("stroke", '#CD5968')
        .attr("fill", '#CD5968')
        .text('A Visualization for twitters about the VIS2020');
    // .attr("opacity", 1)
    // .attr("font-weight", 'bold')
    chart1.append('image')
        .attr('xlink:href',"../data/icon.png")
        .attr('x', width )
        .attr('y', 10)
        .attr('width', 150)
        .attr('weight', 150)
        // .selectAll('.images')
        // .append('image')
        // .attr("xlink:href", function(d){
        //     return "../data/icon.png"
        // })
        // .attr('x', 0)
        // .attr('y', 0)
        // .attr('width', 100)
        // .attr('weight', 100)
}

let x_attr = 'created_at'
let y_attr = 'hot'

function func(x) {
    x = 60000000 - (60000000 - x) / 2
    return x / 3 / 60000000 * x / 60000000 * x + 40000000
}

function get_time(str) {
    let time = ((((parseInt(str.slice(2, 4)) * 12 + parseInt(str.slice(5, 7))) * 31 + parseInt(str.slice(8, 10))) * 24 + parseInt(str.slice(11, 13))) * 60 +
        parseInt(str.slice(14, 16))) * 60 + parseInt(str.slice(17, 19)) - 600000000
    if (time < -100000000) return time
    if (time < 60000000) return func(time)
    return time
}

function get_x_min_max(data, attr) {
    let min = 1e9
    let max = 0
    data.forEach(d => {
        let str = d[attr]
        let v = get_time(str)
        // console.log(v)

        if (v > max)
            max = v
        if (v < min)
            min = v
    })

    return [min, max]
}

function calhot(d) {
    let replies = parseInt(d['replies_count'])
    let retweets = parseInt(d['retweets_count'])
    let likes = parseInt(d['likes_count'])
    return replies + retweets + likes * 0.3
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

function zoomed(event) {
    x = event.transform.rescaleX(x_t);
    update();
}

function update() {
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d => d);

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
            return x(get_time(d[x_attr]));
        })
        .attr('cy', (d, i) => y(calhot(d)))
        .style('visibility', (d, i) => {
            let x_p = x(get_time(d[x_attr]));
            if (x_p < padding.left || x_p > (width - padding.right))
                return 'hidden';
            else return 'visible';
        })
    points.exit().remove();
}

function draw_chart2() {
    padding = { 'left': 0.2 * width, 'bottom': 0.1 * height, 'top': 0.05 * height, 'right': 0.2 * width }

    chart2.append('g')
        .attr('transform', `translate(${padding.left + (width - padding.left - padding.right) / 2}, ${padding.top})`)

    
    chart2.append('g')
        .attr('transform', `translate(${width * 0.0}, ${height * 0.8})`)
        .append('text')
        .attr("font-family", 'roboto')
        .attr("font-size", d => 180)
        .attr("stroke", '#CD5968')
        .attr("fill", '#CD5968')
        .text('💬')

    x_t = d3.scaleLinear()
        .domain(get_x_min_max(data, x_attr))
        .range([padding.left, width - padding.right])
    x = x_t;
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d => d)

    y = d3.scaleLinear()
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

    chart2.append('g')
        .attr('transform', `translate(${padding.left + (width - padding.left - padding.right) / 2}, ${height - padding.bottom})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dx', '-0.4rem')
        .attr('dy', 0.08 * height)
        .text('time')

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
            let str = d[x_attr]
            // console.log(str)
            // console.log(get_time(str))
            return x(get_time(str))
        })
        .attr('cy', (d, i) => {
            // console.log(hot)
            return y(calhot(d))
        })
        .attr('r', (d, i) => {
            return Math.sqrt(calhot(d))
        })
        .style('fill', '#62A55E')
        .attr('opacity', 0.7)
        .on('click', function (e, d) {
            // selectUser(d['Username'])
            selectTweet(d['id'], d['username'], d['hashtags'])
            ///console.log(d['id'],d['username'],d['hashtags'])
        })
        .on('mouseover', (e, d) => {
            let tweet = d['tweet']
            let name = d['name']
            let time = d['created_at']

            let replies = parseInt(d['replies_count'])
            let retweets = parseInt(d['retweets_count'])
            let likes = parseInt(d['likes_count'])

            let content = '<span style="font-size:0.8rem">' + name + '</span>' + '<br>'
                + '<span style="font-size:0.3rem">' + time + '</span>'
                + '<br>' + '<div style="font-size:0.6rem">' + tweet + '</div>'
                + '<p align = "right" style="font-size:0.5rem">' + '👍 ' + likes + '    💬 ' + replies + '</p>'

            let str = d[x_attr]

            let tooltip = d3.select('#tooltip')
            tooltip.html(content)
                .style('left', (width * 0.83) + 'px')
                .style('top', (y(0) + 50) + 'px')
                .style('visibility', 'visible')
            // console.log('here')
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
        .on('zoom', zoomed));
}


function draw_chart3() {
    var num = 26
    var xpos = []
    for (var i = 0; i < num; i++) {
        // 随机生成50个点坐标
        var tmp = Math.floor(Math.random() * 1000)
        xpos.push(tmp)
    }


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

    chart3.append('g')
        .attr('transform', `translate(${width * 0.0}, ${height * 0.8})`)
        .append('text')
        .attr("font-family", 'roboto')
        .attr("font-size", d => 180)
        .attr("stroke", '#CD5968')
        .attr("fill", '#CD5968')
        .text('👴')

    var images = chart3.selectAll(".images")
        .data(data)
        .enter()
        .append("image")

    images.attr("xlink:href", function (d) {
        return "../img/" + d["Username"] + ".jpg"
    })
        .attr('x', (d, i) => {
            //console.log('data', d); 
            return x(parseInt(d["Time"]))
        })
        //.style("opacity", 0.7)
        //.attr('y', (d, i) => y(xpos[i]))
        .attr('y', function (d, i) {
            return y(xpos[parseInt(d["Index"]) - 1])
        })
        .attr("width", (d, i) => 2 * z(parseInt(d["Followers"])))
        .attr("height", (d, i) => 2 * z(parseInt(d["Followers"])))
        .style("opacity", 0.7)
        .on('click', function (e, d) {
            selectUser(d['Username'])
        })
        .on('mouseover', (e, d) => {
            let name = d['Name']

            let content = '<span style="font-size:0.8rem">' + name + '</span>' + '<br>'

            //let str = d[x_attr];

            let tooltip = d3.select('#tooltip1');
            tooltip.html(content)
                .style('left', x(parseInt(d["Time"])) + 'px')
                //.style('top',  y(xpos[parseInt(d["Index"])-1]) + 'px')
                .style('top',  y(xpos[parseInt(d["Index"])-1]) -350 + 'px')
                .style('visibility', 'visible');
            console.log(y(xpos[parseInt(d["Index"]) - 1]))
        })
        .on('mouseout', (e, d) => {
            let tooltip = d3.select('#tooltip1');
            tooltip.style('visibility', 'hidden');
        })


    // var size = 25
    // var defs = chart3.append('svg:defs');
    // defs.append("svg:pattern")
    // .attr("id", "grump_avatar")
    // .attr("width", size)
    // .attr("height", size)
    // .attr("patternUnits", "userSpaceOnUse")
    // .attr("preserveAspectRatio","none") 
    // .append("svg:image")
    // .attr("xlink:href", "../img/skipher.jpg")
    // .attr("width", size)
    // .attr("height", size)
    // .attr("x", -size/3)
    // .attr("y", -4);


    // chart3.append('g')
    //     .selectAll('circle')
    //     .data(data)
    //     .enter().append('circle')
    //     .attr('class', 'point')
    //     .attr('cx', (d, i) => {
    //         //console.log('data', d); 
    //         return x(parseInt(d["Time"]))
    //     })
    //     .style("opacity", 0.7)
    //     .attr('cy', (d, i) => y(xpos[i]))
    //     .attr('r', (d, i) => z(parseInt(d["Followers"])))
    // .attr('fill',url('./data/computersociety.jpg'))
    // .style("fill", (d,i) => {
    //     if (d["Username"] == "computersociety")
    //     return "url(#grump_avatar)"
    // })
    // .on('click', function(e, d){
    //     selectUser(d['Username'])
    // })
    // .on('mouseover', (e, d) => {
    //     console.log(d["Username"])
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
    // })
}


d3.csv(data_file).then(function (DATA) {
    data = DATA.filter((d, i) => (get_time(d[x_attr]) > -100000000))
    process(data)
    hashtags = extract(data)
    cal_posi(hashtags)
    process_overlap(hashtags)
    draw_hashtags(hashtags)
    draw_chart2()
    //draw_chart3();
})

d3.csv("../data/Follow.csv").then(function (DATA) {
    data = DATA.filter((d, i) => d["Time"] > 0)
    //console.log(data);
    draw_chart3()
})