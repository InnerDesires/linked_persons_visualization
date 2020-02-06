class TimeLogger {
    constructor(name = 'Default Time Log') {
        this.name = name;
        this.start = performance.now();
        this.labels = [];
    }

    label(_label) {
        if (!_label) {
            _lable = "Default Label " + this.labels.length;
        }
        const timeStamp = performance.now();
        const _durationFromBeginning = timeStamp - this.start;
        let _duration;
        if (this.labels.length == 0) {
            _duration = timeStamp - this.start;
        } else {
            _duration = timeStamp - this.labels[this.labels.length - 1].time;
        }

        this.labels.push({
            duration: _duration,
            label: _label,
            durationFromBeginning: _durationFromBeginning,
            time: timeStamp
        })
    }

    showReport(digitsAfterDot = 3) {
        const end = performance.now();
        console.groupCollapsed(`Report For: [${this.name}][${_duration(this.start, end, digitsAfterDot)} sec.]`)
        if (this.labels.length > 0) {
            let maxLen = 0;

            this.labels.forEach(_label => {
                if (_label.label.length > maxLen) {
                    maxLen = _label.label.length;
                }
            })
            console.group("Time measurements: [label][duration_from_last][duration_from_start]");
            this.labels.forEach(label => {
                console.info(`${appendWithSpaces(label.label, maxLen)}[${toSeconds(label.duration, digitsAfterDot)} sec.][${toSeconds(label.durationFromBeginning, digitsAfterDot)} sec.]`);
            })
            console.groupEnd();
        } else {
            console.group("No labels defined");
            console.groupEnd();
        }
        console.group("Summary");
        console.info(`[Overall][${_duration(this.start, end, digitsAfterDot)} sec.]`);

        console.groupEnd();
        console.groupEnd();
    }
}

function appendWithSpaces(str, len) {
    while (str.length < len) {
        str = str + ' ';
    }
    return str;
}

function _duration(t1, t2, digitsAfterComma = 3) {
    return `${((t2 - t1) / 1000).toFixed(digitsAfterComma)}`
}

function toSeconds(t, digitsAfterComma = 3) {
    return (t / 1000).toFixed(digitsAfterComma);
} 