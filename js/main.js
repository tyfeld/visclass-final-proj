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

// extract hashtags information from processed data
// returned hashtags: [['hashtag1', sum1], ['hashtag2', sum2], ...]
function extract(data) {
    filted = 'vis2020'; // the hashtag to be ignored
    hashtags = [[filted, 0]];
    for (d in data) {
        tags = data[d]['hashtags'];
        for (t in tags) {
            tag = tags[t];
            if (tag === filted) continue;
            for (var k = 0; k < hashtags.length; ++k) {
                if (hashtags[k][0] === tag) {
                    hashtags[k][1] += 1;
                    break;
                }
                if (k === hashtags.length - 1) {
                    var arr = [tag, 0];
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
// calculate the x value of each hashtag, from middle to two sides
// -*- to be changed (mean of twitters' x values) -*-
// returned hashtags: [['hashtag1', sum1, height1, x1], ['hashtag2', sum2, height2, x2], ...]
function cal_posi(data) {
    top_height = 50;
    gap_y = 50;
    gap_x = 200;
    max_tags = 5; // criteria 1: max num of tags permitted within the same height
    max_gap = 5; // criteria 2: |sum1-sum2| <= max_gap

    cnter = 0;
    curr_value = data[0][1];
    curr_height = top_height;
    for (d in data) {
        if (cnter < max_tags && curr_value - data[d][1] <= max_gap) {
            cnter += 1;
        }
        else {
            curr_height += gap_y;
            curr_value = data[d][1];
            cnter = 1;
        }
        data[d].push(curr_height);
        data[d].push(width / 2 + gap_x / 2 * Math.floor(cnter / 2) * Math.pow(-1, cnter));
    }
}

function draw_hashtags(hashtags) {
    let svg = d3.select('#container')
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    let tag_node = svg.append('g')
        .selectAll("rect")
        .data(hashtags)
        .join("rect")
        .attr("height", 30)
        .attr("weight", 50)
        .attr("stroke", '#fff')
        .attr("stroke-width", 0.5)
        .attr("fill", none)
        .attr("x", d => d[3])
        .attr("y", d => d[2])
        .attr("rx", 15)
        .attr("ry", 15)

    let text = svg.append("g")
        .selectAll("text")
        .data(hashtags)
        .join("text")
        .text(d => d[0])
        .attr("x", d => d[3])
        .attr("y", d => d[2])

}

d3.csv(data_file).then(function (DATA) {
    data = DATA;
    process(data);
    hashtags = extract(data);
    cal_posi(hashtags);
    // console.log(hashtags);
    /* download as a csv file
    ...
    */
    draw_hashtags(hashtags);
})

