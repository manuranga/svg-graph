var w = 800,
    h = 800,
    i = 0,
    gap = 5,
    defaultHeight = 40,
    defaultWidth = 80;

var tree = d3.layout.cluster();


d3.json("plan.json", function (json) {
    var vis = d3.select("body").append("svg:svg")
        .attr("width", w)
        .attr("height", h + defaultHeight * 4)
        .append("g");
    drawPlan(w, h, json, vis, true);
});

function drawPlan(w, h, root, parent, drawSubGraph) {

    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return  [d.x * w , (1 - d.y) * h];
        });

    var nodes = tree.nodes(root);

    var node = parent.selectAll("rect")
        .data(nodes, function (d) {
            return d.id || (d.id = ++i);
        });

    var enter = node.enter();

    var rect = enter.append("svg:rect");
    rect.each(function (d, i) {
        var maxDepth = 0;
        var maxWidths = 0;
        d.subnodes = null;
        if (drawSubGraph && d.hasOwnProperty("subplan")) {
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
    });

    var link = parent.selectAll("path")
        .data(tree.links(nodes), function (d) {
            return d.target.id;
        });

    link.enter().insert("svg:path", "rect")
        .attr("d", diagonal);


    rect.attr("x", function (d) {
        return d.x * w - (d.width * defaultWidth) / 2;
    })
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("y", function (d) {
            return (1 - d.y) * (h - defaultHeight);
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
            return (1 - d.y) * (h - defaultHeight) + defaultHeight / 2;
        })
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(function (d) {
            return d.name;
        });

    rect.each(function (d) {
        if (d.subnodes) {
            var thisD3 = d3.select(this);
            var subGroup = parent.append("g");
            subGroup.attr("transform", "translate(" + thisD3.attr("x") + "," + (Number(thisD3.attr("y")) + gap) + ")");
            drawPlan(thisD3.attr("width"), thisD3.attr("height") - gap * 2, d.subplan, subGroup, false);
        }
    });
}

