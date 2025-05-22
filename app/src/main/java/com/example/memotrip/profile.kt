package com.example.memotrip

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ProfileScreen() {
    // Conteneur principal pour centrer le contenu
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        // Colonne contenant les éléments du profiL
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Image de profil
            Image(
                imageVector = Icons.Default.AccountCircle,
                contentDescription = "Image de profil",
                modifier = Modifier
                    .size(100.dp)
                    .clip(CircleShape)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Nom et prénom
            Text(text = "Nom : Dupont", fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text(text = "Prénom : Jean", fontSize = 18.sp)

            Spacer(modifier = Modifier.height(32.dp))

            // Bouton pour modifier les informations
            Button(
                onClick = { /* Action pour modifier les infos */ },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3F51B5))
            ) {
                Text("Modifier les informations")
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Bouton pour supprimer le profil
            Button(
                onClick = { /* Action pour supprimer le profil */ },
                colors = ButtonDefaults.buttonColors(containerColor = Color.Red)
            ) {
                Text("Supprimer le profil")
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ProfileScreenPreview() {
    ProfileScreen()
}
