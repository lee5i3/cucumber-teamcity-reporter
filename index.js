const cucumber = require('cucumber');

var logger = {
    log: function (msg) {
        process.stdout.write(msg + '\n');
    },
    error: function (msg) {
        process.stderr.write(msg + '\n');
    }
}

var formatter = function () {

    var escape = function (string) {
        return string
            .replace(/\|/g, '||')
            .replace(/'/g, "|'")
            .replace(/\n/g, '|n')
            .replace(/\r/g, '|r')
            .replace(/\[/g, '|[')
            .replace(/\]/g, '|]');
    }

    this.registerHandler("BeforeFeature", (feature, done) => {
        logger.log(`##teamcity[testSuiteStarted name='${escape(feature.getName())}']`);
        done();
    });

    this.registerHandler("AfterFeature", (feature, done) => {
        logger.log(`##teamcity[testSuiteFinished name='${escape(feature.getName())}']`);
        done();
    });

    this.registerHandler("BeforeScenario", (scenario, done) => {
        logger.log(`##teamcity[testStarted name='${escape(scenario.getName())}' captureStandardOutput='true']`);
        done();
    });

    this.registerHandler("AfterScenario", (scenario, done) => {
        logger.log(`##teamcity[testFinished name='${escape(scenario.getName())}']`);
        done();
    });

    this.registerHandler("StepResult", (stepResult, done) => {
        var step = stepResult.getStep();

        var line = step.getLine();
        var name = step.getName();

        var location = escape(`${name} line ${line}`);

        if (name && line) {
            logger.error(location);
        }

        var status = stepResult.getStatus();

        if (status === cucumber.Status.FAILED || status === cucumber.Status.AMBIGUOUS) {
            var message = stepResult.getFailureException();
            if (message) {
                logger.error(`##teamcity[testFailed name='${name}' message='Error during ${name}' details='${escape(message.stack || message)}']`);
            }

            return done();
        }

        done();
    });
}

module.exports = formatter;