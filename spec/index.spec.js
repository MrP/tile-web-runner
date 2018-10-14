/*global jasmine, expect*/
var execSync = require('child_process').execSync;
var rimraf = require('rimraf-then');
var expectImagesToBeTheSame = require('./expectImagesToBeTheSame.helper.js').expectImagesToBeTheSame;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

process.env.AWS_ACCESS_KEY = "KEYKEYKEY";
process.env.AWS_SECRET_ACCESS_KEY = "SECRETSECRET";
process.env.S3_BUCKET_NAME = "TEST_BUCKET_NAME";

describe("tile-web-runer", () => {
    it("runs", (done) => {
        const stdout = execSync("node index.js http://otterprojectsltd.com/index.html").toString();
        expect(stdout.includes("The AWS Access Key Id you provided does not exist in our records")).toBe(true);
        expectImagesToBeTheSame("/tmp/tileweb/otterprojectsltdcom/indexhtml/files/pagetiles/tile_0_0_0.png", "spec/expected/tile_0_0_0.png")
            .then(done)
            .catch(done.fail);
    });
    afterEach(function (done) {
        rimraf("/tmp/tileweb/")
            .then(done)
            .catch(done.fail);
    });
});