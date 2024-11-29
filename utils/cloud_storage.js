require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const { format } = require('util');
const env = require('../config/env')
const url = require('url');
const { v4: uuidv4 } = require('uuid');
const uuid = uuidv4();
const data = {
    type: process.env.TYPE,
    project_id: process.env.PROJECTID,
    private_key_id: process.env.KEYID,
    private_key: process.env.PRIVATEKEY,
    client_email: process.env.CLIENTEMAIL,
    client_id: process.env.CLIENTID,
    auth_uri: process.env.AUTHURI,
    token_uri: process.env.TOKENURI,
    auth_provider_x509_cert_url: process.env.CERTURL,
    client_x509_cert_url: process.env.CLIENTURL,
    universe_domain: process.env.DOMAIN
}

const json = JSON.stringify(data);

const storage = new Storage({
    projectId: "fastbite-62bd1",
    keyFilename: json
});

const bucket = storage.bucket("gs://fastbite-62bd1.firebasestorage.app");

/**
 * Subir el archivo a Firebase Storage
 * @param {File} file objeto que sera almacenado en Firebase Storage
 */
module.exports = (file, pathImage, deletePathImage) => {
    return new Promise((resolve, reject) => {
        
        console.log('delete path', deletePathImage)
        if (deletePathImage) {

            if (deletePathImage != null || deletePathImage != undefined) {
                const parseDeletePathImage = url.parse(deletePathImage)
                var ulrDelete = parseDeletePathImage.pathname.slice(23);
                const fileDelete = bucket.file(`${ulrDelete}`)

                fileDelete.delete().then((imageDelete) => {

                    console.log('se borro la imagen con exito')
                }).catch(err => {
                    console.log('Failed to remove photo, error:', err)
                });

            }
        }


        if (pathImage) {
            if (pathImage != null || pathImage != undefined) {

                let fileUpload = bucket.file(`${pathImage}`);
                const blobStream = fileUpload.createWriteStream({
                    metadata: {
                        contentType: 'image/png',
                        metadata: {
                            firebaseStorageDownloadTokens: uuid,
                        }
                    },
                    resumable: false

                });

                blobStream.on('error', (error) => {
                    console.log('Error al subir archivo a firebase', error);
                    reject('Something is wrong! Unable to upload at the moment.');
                });

                blobStream.on('finish', () => {
                    // The public URL can be used to directly access the file via HTTP.
                    const url = format(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media&token=${uuid}`);
                    console.log('URL DE CLOUD STORAGE ', url);
                    resolve(url);
                });

                blobStream.end(file.buffer);
            }
        }
    });
}