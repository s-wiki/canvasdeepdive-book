var files = [
    '01a_overview.md',
    '02a_handson_charts.md',
    '03a_advanced_drawing.md',
    '04a_animation.md',
    //'05a_gaming1.md',
    '05b_gaming2.md',
    '12a_intro_audio.md',
    '12b_deep_audio.md',
    '13a_gameinput.md',
    ];


// ================

var ometajs = require('ometa-js');
var fs = require('fs');
var Mustache = require('mustache');

var chapter_template = fs.readFileSync('templates/chapter.template').toString();

var MD = require('./markdown2.ometajs').Markdown;

MD.classProcessors['screenshot'] = function(append, text, href) {
    append('<div class="panel panel-warning screenshot">');
    append("<div class='panel-heading'>");
    append("<b style='font-size:90%'>SCREENSHOT</b> ");
    append(text);
    append("</div>");
    append("<div class='panel-body'><img src='../../canvasdeepdive-book/text/"+href+"'/></div>");
    append("</div>");
    /*

    append("<p class='screenshot'>");
    append("<img src='../../canvasdeepdive-book/text/"+href+"'/>");
    append("<b>SCREENSHOT</b>");
    append("<i>"+text+"</i>");
    append("</p>");
    */
}

MD.customProcessors['interactive'] = function(append, params) {
    append('<div class="panel panel-success interactive">');
    append("<div class='panel-heading'>");
    append("<b style='font-size:90%'>INTERACTIVE</b> Click to view");
    append("</div>");
    append("<div class='panel-body'>");
    append("<a href='../../canvasdeepdive-book/text/"+params.href+"'>");
    append("<img src='../../canvasdeepdive-book/text/"+params.image+"'/>");
    append("</a></div>");
    append("</div>");
}

MD.customProcessors['jangle'] = function(append, params) {
    console.log("jangle params",params);
    console.log("code block = ", MD.codeblocks[params.id]);

    params.code = MD.codeblocks[params.id];
    var htmlcode = params.code;
    var rawcode  = params.code;
    htmlcode = htmlcode.replace(/(var\d)/g,'<i class="$1"></i>');

    var dvals = [];
    var paramNames = [];
    for(var name in params.defaultValues) {
        var val = params.defaultValues[name];
        console.log("name = ",name,val);
        htmlcode = htmlcode.replace('value'+name,val);
        dvals.push(val);
        paramNames.push(name);
    }

    params.htmlcode = htmlcode;
    params.rawcode  = rawcode;
    params.drawCall = 'drawIt(ctx,'+dvals.join(',')+');';
    params.paramNames = '"'+paramNames.join('","')+'"';
    params.paramStruct = JSON.stringify(params.defaultValues);

    var template = fs.readFileSync('templates/jangle.template').toString();
    append(Mustache.render(template,params));

}


var count = 1;
if(!fs.existsSync('build')) fs.mkdirSync('build');


function findTitle(obj) {
    for(var id in obj) {
        if(obj[id].level == 1) {
            return {
                id: id,
                text: obj[id].text,
            }
        }
    }
}

function findSections(obj) {
    var sections = [];
    for(var id in obj) {
        if(obj[id].level == 2) {
            sections.push({
                id: id,
                text: obj[id].text
            });
        }
    }
    return sections;
}
var results = [];
files.forEach(function(filename) {
    var text = fs.readFileSync('chapters/'+filename);
    MD.reset();
    var rendered = MD.matchAll(text.toString(),'start');
    rendered.number = count;
    var text = Mustache.render(chapter_template,rendered);
    fs.writeFileSync('build/chapter'+count+'.html',text);
    results.push({
        title: findTitle(rendered.sections),
        sections: findSections(rendered.sections),
        filename: 'chapter'+count+'.html',
    });
    count++;
});

var toc_templ = fs.readFileSync('templates/toc.template').toString();
var toc = {
    bookname: 'HTML Canvas Deep Dive',
    sections: results,
}
fs.writeFileSync('build/toc.html',Mustache.render(toc_templ,toc));
//console.log(Mustache.render(toc_templ,toc));



/*


the joshdown parser needs to handle

headers, for rendering and to capture as sections for later TOC processing
paragraphs with inline styles
lists
code setions

paragraphs marked as notes
an image marked as a figure with a title
a list of images marked as a photo gallery
a code section marked as interactive, with all of the correct code generated
an inline link marked as a glossary item
an inline link to external vs internal reference.


*/
