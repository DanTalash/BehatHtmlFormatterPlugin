//Provides log text filtering
var logFilter = (function () {
    const LOGLEVELS = ['ERROR', 'INFO', 'DEBUG', 'TRACE'];
    
    var regexString = `\\[(${LOGLEVELS.join('|')})\\]`;
    var regex = new RegExp(regexString);
    
    var logLevelNumbers = {};

    var rowData = [];
    
    for (var i = 0; i < LOGLEVELS.length; i++) {
        var level = LOGLEVELS[i];
        logLevelNumbers[level] = i + 1;
    }

    function splitLog(log) {
        var chunks = log.split(regex);
        var logRows = [];
        var nextTime, time, severity, content, contentLines, contentLineCount;
        for (var i = 0; i < chunks.length; i+=2) {
            if (i == 0) {
                time = chunks[i];
                severity = chunks[i + 1];
                content = chunks[i + 2];
                i++;
            } else {
                time = nextTime;
                severity = chunks[i];
                content = chunks[i + 1];
            }

            contentLines = content.split("\n");
            contentLineCount = contentLines.length;
            nextTime = contentLines[contentLineCount - 1];
            contentLines = contentLines.splice(0, contentLineCount - 1);
            content = contentLines.join("\n");
            
            logRows.push({
                index: Math.floor((i - 1) / 2),
                severity: severity,
                html: `${time}[${severity}]${content}\n`
            });
        }
        
        return logRows;
    }

    function createButton(name, level) {
        return `<a onclick="logFilter.filter('${level}')" class="btn btn-default" role="button">${name}</a>`;
    }

    var public = {
        //Filters
        filter: function (logLevel) {
            logLevel = logLevelNumbers[logLevel] || 0;

            $('pre').each((i, e) => {
                var data = rowData[i];
                var html = '';

                for (var j = 0; j < data.rows.length; j++) {
                    var row = data.rows[j];
                    var rowLevel = logLevelNumbers[row.severity];

                    if (logLevel == 0 || rowLevel <= logLevel) {
                        html += row.html;
                    }
                }

                e.innerHTML = html;
            });
        },

        init: function() {
            console.log('Log filter initializing');

            $('pre').each((i, e) => {
                var $el = $(e);
                var data = rowData[i] || {};

                if (!data.hasOwnProperty('originalContent')) {
                    data.originalContent = $el.html();
                    data.rows = splitLog(data.originalContent);
                }
                
                rowData[i] = data;
            });

            //Generate buttons
            var buttonHTML = createButton('All', 'All');
            
            for (var i = 0; i < LOGLEVELS.length; i++) {
                var level = LOGLEVELS[i];

                buttonHTML += createButton(level, level);
            }

            $('div.filters').get(0).innerHTML += buttonHTML;

            console.log('Log filter initialized');
        }
    };

    //Initialize when the page loads
    $(public.init.bind(public));

    return public;
})();
