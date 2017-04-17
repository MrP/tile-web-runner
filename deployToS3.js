'use strict';

const s3 = require('s3');
const AWS = require('aws-sdk');
const rp = require('request-promise-native');
const path = require('path');

function getAwsS3Client() {
    if (process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_ACCESS_KEY) {
        return Promise.resolve(new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            signatureVersion: 'v4'
        }));
    } else if (process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI) {
        return rp({
            uri: `http://169.254.170.2${process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI}`,
            json: true
        })
        .then((awscredentials) => {
            return new AWS.S3({
                accessKeyId: awscredentials.AccessKeyId,
                secretAccessKey: awscredentials.SecretAccessKey,
                sessionToken: awscredentials.Token,
                signatureVersion: 'v4'
            });
        });
    } else {
        return Promise.resolve(new AWS.S3({
            signatureVersion: 'v4'
        }));
    }
}

module.exports.deployToS3 = (folder, pathOutPage) => {
    return getAwsS3Client()
    .then((awsS3Client) => {
        const client = s3.createClient({
            s3Client: awsS3Client,
            maxAsyncS3: 20,     // this is the default
            s3RetryCount: 3,    // this is the default
            s3RetryDelay: 1000, // this is the default
            multipartUploadThreshold: 20971520, // this is the default (20 MB)
            multipartUploadSize: 15728640, // this is the default (15 MB)
        });
        const params = {
            localDir: path.join(folder, pathOutPage),
            deleteRemoved: true,
            s3Params: {
                Bucket: process.env.S3_BUCKET_NAME,
                Prefix: pathOutPage,
            },
        };
        return new Promise(function (resolve, reject) {
            const uploader = client.uploadDir(params);
            uploader.on('error', reject);
            uploader.on('end', resolve);
        })
        .then(() => {
            const zipFile = pathOutPage.replace(/\./g, '') + '.zip';
            const params = {
                localFile: path.join(folder, zipFile),
                s3Params: {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: zipFile
                },
            };
            return new Promise(function (resolve, reject) {
                const uploader = client.uploadFile(params);
                uploader.on('error', reject);
                uploader.on('end', resolve);
            });
        });
    });
};