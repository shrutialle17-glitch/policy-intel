const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'documents'; // Assuming 'documents' is the main bucket

exports.uploadFile = async (fileBuffer, fileName, mimeType) => {
  const filePath = fileName.includes('/') ? fileName : `policies/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });
  
  if (error) throw error;
  return data.path;
};

exports.getSignedUrl = async (path, expiresIn = 300) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn);
    
  if (error) throw error;
  return data.signedUrl;
};

exports.downloadFile = async (path) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(path);
    
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
};
