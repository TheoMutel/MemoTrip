package com.example.memotrip

// MapScreen.kt

import android.graphics.BitmapFactory
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.google.android.gms.maps.model.CameraPosition
import com.google.maps.android.compose.*
import com.google.android.gms.maps.model.LatLng
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

@Composable
fun AddPhotoScreen() {
    val context = LocalContext.current
    val cameraProviderFuture = remember { ProcessCameraProvider.getInstance(context) }
    var imageCapture: ImageCapture? by remember { mutableStateOf(null) }
    var capturedImage by remember { mutableStateOf<ImageBitmap?>(null) }
    val coroutineScope = rememberCoroutineScope()

    var showDialog by remember { mutableStateOf(false) }
    var noteText by remember { mutableStateOf("") }

    LaunchedEffect(cameraProviderFuture) {
        val cameraProvider = cameraProviderFuture.get()
        val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
        val imageCaptureConfig = ImageCapture.Builder().build()
        imageCapture = imageCaptureConfig

        cameraProvider.unbindAll()
        cameraProvider.bindToLifecycle(
            context as AppCompatActivity,
            cameraSelector,
            imageCaptureConfig
        )
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Button(
            onClick = {
                val photoFile = File(context.getExternalFilesDir(null), "captured_image.jpg")
                val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()
                imageCapture?.takePicture(
                    outputOptions,
                    ContextCompat.getMainExecutor(context),
                    object : ImageCapture.OnImageSavedCallback {
                        override fun onImageSaved(outputFileResults: ImageCapture.OutputFileResults) {
                            coroutineScope.launch {
                                withContext(Dispatchers.IO) {
                                    val bitmap = BitmapFactory.decodeFile(photoFile.absolutePath)
                                    capturedImage = bitmap.asImageBitmap()
                                }
                                showDialog = true // Affiche le pop-up pour ajouter une note
                            }
                        }

                        override fun onError(exception: ImageCaptureException) {
                            exception.printStackTrace()
                        }
                    }
                )
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3F51B5))
        ) {
            Text("Capturer une photo", color = Color.White, fontSize = 16.sp)
        }

        Spacer(modifier = Modifier.height(16.dp))

        capturedImage?.let {
            Image(
                bitmap = it,
                contentDescription = "Image capturée",
                modifier = Modifier
                    .fillMaxWidth()
                    .height(300.dp)
                    .background(Color(0xFFE0E0E0), shape = MaterialTheme.shapes.medium)
                    .padding(8.dp)
            )
        }

        if (showDialog) {
            AlertDialog(
                onDismissRequest = { showDialog = false },
                title = { Text("Ajouter une note") },
                text = {
                    Column {
                        Text("Entrez une note pour cette photo :")
                        Spacer(modifier = Modifier.height(8.dp))
                        BasicTextField(
                            value = noteText,
                            onValueChange = { noteText = it },
                            textStyle = TextStyle(fontSize = 16.sp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFFE0E0E0), shape = MaterialTheme.shapes.medium)
                                .padding(16.dp)
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            // Logique pour enregistrer la note
                            showDialog = false // Ferme le pop-up
                        }
                    ) {
                        Text("Enregistrer")
                    }
                },
                dismissButton = {
                    Button(
                        onClick = {
                            showDialog = false // Ferme le pop-up sans enregistreR
                        }
                    ) {
                        Text("Annuler")
                    }
                }
            )
        }
    }
}
