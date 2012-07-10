var w = 600,
    h = 600,
    i = 0,
    defaultHeight = 40,
    defaultWidth = 80;

d3.json("plan.json", function (json) {
    var vis = d3.select("body").append("svg:svg")
        .attr("width", w)
        .attr("height", h + defaultHeight * 4)
        .append("g");
    drawPlan(w, h, json, vis, true);
});

function drawPlan(w, h, root, parent,drawSubGraph) {
    var tree = d3.layout.cluster();

    var nodes = tree.nodes(root);

    var node = parent.selectAll("rect")
        .data(nodes, function (d) {
            return d.id || (d.id = ++i);
        });

    var enter = node.enter();

    var rect = enter.append("svg:rect");
    if (drawSubGraph) {
        rect.each(function (d, i) {
            var maxDepth = 0;
            var maxWidths = 0;
            d.subnodes = null;
            if (d.hasOwnProperty("subplan")) {
                var subNodes = tree.nodes(d.subplan);
                d.subnodes = subNodes;
                var getDepth = function (e) {
                    return e.depth
                };
                maxDepth = d3.max(subNodes, getDepth) + 1;
                maxWidths = d3.max(d3.nest()
                    .key(getDepth)
                    .rollup(function (g) {
                        return g.length;
                    })
                    .entries(subNodes), function (e) {
                    return e.values;
                });
            }
            d.height = maxDepth + 1;
            d.width = maxWidths + 1;
        })
    }
    rect.attr("x", function (d) {
        return d.x * w - (d.width * defaultWidth) / 2;
    })
        .attr("y", function (d) {
            return (1 - d.y) * h;
        })
        .attr("width", function (d) {
            return d.width * defaultWidth;
        })
        .attr("height", function (d) {
            return d.height * defaultHeight;
        });

    enter.append("text")
        .attr("x", function (d) {
            return d.x * w;
        })
        .attr("y", function (d) {
            return (1 - d.y) * h + defaultHeight / 2;
        })
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(function (d) {
            return d.name;
        });

    rect.each(function (d) {
        console.log(this);
        if(d.subnodes){
        }
    });

//    node.each(function(d,i){
//        console.log(d);
//        if(d.hasOwnProperty("subplan")){
//            var subTree = d3.layout.cluster();
//            var subNodes = subTree.nodes(d.subplan);
//            console.log(subNodes);
//        }
//    });

}


function update() {

    var link = vis.selectAll("path")
        .data(tree.links(nodes), function (d) {
            return d.target.id;
        });

    link.enter().insert("svg:path", "circle")
        .attr("d", diagonal);


    var enter = node.enter();

    enter.append("svg:rect")
        .attr("x", function (d) {
            return d.x - nodeWidth / 2;
        })
        .attr("y", function (d) {
            return h - d.y;
        })
        .attr("width", nodeWidth)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("height", nodeHeight)
        .style("fill", function (d) {
            return "white";
        });

    enter.append("svg:text")
        .attr("x", function (d) {
            return d.x;
        })
        .attr("y", function (d) {
            return h - d.y + nodeHeight / 2;
        })
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(function (d) {
            return d.name;
        })

}
