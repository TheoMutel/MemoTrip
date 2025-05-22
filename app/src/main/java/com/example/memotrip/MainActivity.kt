package com.example.memotrip
import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.memotrip.ui.theme.MemotripTheme
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.rememberCameraPositionState

class MemoTripActivity : AppCompatActivity() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private val locationList = mutableListOf<Location>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                super.onLocationResult(locationResult)
                for (location in locationResult.locations) {
                    locationList.add(location)
                }
            }
        }

        requestPermissionsIfNeeded()
    }

    private fun requestPermissionsIfNeeded() {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.CAMERA
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.CAMERA),
                REQUEST_LOCATION_PERMISSION
            )
        } else {
            initializeContent()
            requestLocationUpdates()
        }
    }

    private fun initializeContent() {
        setContent {
            MemotripTheme {
                MemoTripApp(locationList)
            }
        }
    }

    private fun requestLocationUpdates() {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            try {
                val locationRequest =
                    LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000)
                        .setMinUpdateIntervalMillis(5000)
                        .build()
                fusedLocationClient.requestLocationUpdates(
                    locationRequest,
                    locationCallback,
                    mainLooper
                )
            } catch (e: SecurityException) {
                e.printStackTrace()
            }
        } else {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
                REQUEST_LOCATION_PERMISSION
            )
        }
    }

    companion object {
        private const val REQUEST_LOCATION_PERMISSION = 1
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_LOCATION_PERMISSION && grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
            initializeContent()
            requestLocationUpdates()
        }
    }
}

@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MemoTripApp(locationList: List<Location>) {
    val navController = rememberNavController() // Crée le NavController pour gérer la navigatioN

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "MemoTrip",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp,
                        color = Color.White // Texte en blanc
                    )
                },
                actions = {
                    IconButton(onClick = {
                        navController.navigate("map") // Naviguer vers la carte
                    }) {
                        Text(
                            text = "Carte",
                            color = Color.White // Texte en blanc
                        )
                    }
                    IconButton(onClick = {
                        navController.navigate("profile") // Naviguer vers le profil
                    }) {
                        Text(
                            text = "Profile",
                            color = Color.White // Texte en blanc
                        )
                    }
                },
                colors = TopAppBarDefaults.smallTopAppBarColors(
                    containerColor = Color(0xFF3F51B5), // Couleur de fond
                    titleContentColor = Color.White,   // Couleur du titre
                    actionIconContentColor = Color.White // Couleur des icônes et du texte dans les actions
                )
            )

        }
    ) {
        NavigationGraph(navController = navController, locationList = locationList)
    }
}

@Composable
fun NavigationGraph(navController: NavHostController, locationList: List<Location>) {
    NavHost(navController = navController, startDestination = "home") {
        composable("profile") {
            ProfileScreen() // Affiche l'écran de profil
        }
        composable("home") {
            HomeScreen(locationList) // Affiche l'écran principal avec la carte
        }
        composable("map") {
            MapboxScreen() // Affiche l'écran de la carte
        }
    }
}

@Composable
fun HomeScreen(locationList: List<Location>) {
    val mapProperties = MapProperties(isMyLocationEnabled = true)
    val cameraPositionState = rememberCameraPositionState()

    LazyColumn(
        modifier = Modifier
            .padding(16.dp)
            .fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        item {
            Text("Carte des souvenirs :", fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
        }

        item {
            AddPhotoScreen()
        }
    }
}
