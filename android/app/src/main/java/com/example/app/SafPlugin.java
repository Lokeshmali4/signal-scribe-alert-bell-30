package com.example.app;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;
import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.FileOutputStream;
import java.io.IOException;

@CapacitorPlugin(name = "SafPlugin")
public class SafPlugin extends Plugin {

    private ActivityResultLauncher<Intent> documentPickerLauncher;
    private PluginCall savedCall;

    @Override
    public void load() {
        super.load();
        
        // Initialize the document picker launcher
        documentPickerLauncher = getActivity().registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            new ActivityResultCallback<ActivityResult>() {
                @Override
                public void onActivityResult(ActivityResult result) {
                    if (savedCall == null) return;
                    
                    if (result.getResultCode() == Activity.RESULT_OK) {
                        Intent data = result.getData();
                        if (data != null) {
                            Uri uri = data.getData();
                            if (uri != null) {
                                // Take persistent URI permissions
                                getContext().getContentResolver().takePersistableUriPermission(
                                    uri, 
                                    Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                                );
                                
                                // Get file name
                                String fileName = getFileName(uri);
                                
                                JSObject response = new JSObject();
                                response.put("uri", uri.toString());
                                response.put("name", fileName);
                                response.put("success", true);
                                
                                savedCall.resolve(response);
                            } else {
                                savedCall.reject("No URI received");
                            }
                        } else {
                            savedCall.reject("No data received");
                        }
                    } else {
                        savedCall.reject("User cancelled file selection");
                    }
                    
                    savedCall = null;
                }
            }
        );
    }

    @PluginMethod
    public void openDocumentPicker(PluginCall call) {
        savedCall = call;
        
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("text/plain"); // Only show text files
        intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"text/plain", "text/*"});
        intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI, 
            Uri.parse("content://com.android.externalstorage.documents/tree/primary%3A"));
        
        documentPickerLauncher.launch(intent);
    }

    @PluginMethod
    public void writeToSafUri(PluginCall call) {
        String uriString = call.getString("uri");
        String content = call.getString("content");
        
        if (uriString == null || content == null) {
            call.reject("Missing required parameters");
            return;
        }
        
        try {
            Uri uri = Uri.parse(uriString);
            ParcelFileDescriptor pfd = getContext().getContentResolver().openFileDescriptor(uri, "w");
            
            if (pfd != null) {
                FileOutputStream fileOutputStream = new FileOutputStream(pfd.getFileDescriptor());
                fileOutputStream.write(content.getBytes());
                fileOutputStream.close();
                pfd.close();
                
                JSObject response = new JSObject();
                response.put("success", true);
                call.resolve(response);
            } else {
                call.reject("Could not open file descriptor");
            }
        } catch (IOException e) {
            call.reject("Error writing file: " + e.getMessage());
        } catch (SecurityException e) {
            call.reject("Permission denied: " + e.getMessage());
        } catch (Exception e) {
            call.reject("Unexpected error: " + e.getMessage());
        }
    }

    private String getFileName(Uri uri) {
        String result = null;
        if (uri.getScheme().equals("content")) {
            try (Cursor cursor = getContext().getContentResolver().query(uri, null, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                    if (nameIndex >= 0) {
                        result = cursor.getString(nameIndex);
                    }
                }
            }
        }
        if (result == null) {
            result = uri.getPath();
            int cut = result.lastIndexOf('/');
            if (cut != -1) {
                result = result.substring(cut + 1);
            }
        }
        return result;
    }
}