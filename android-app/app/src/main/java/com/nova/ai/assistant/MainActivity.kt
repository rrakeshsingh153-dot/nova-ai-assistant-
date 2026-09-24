package com.nova.ai.assistant

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.nova.ai.assistant.ui.AgentDashboardScreen
import com.nova.ai.assistant.ui.AppsScreen
import com.nova.ai.assistant.ui.ChatScreen
import com.nova.ai.assistant.ui.HistoryScreen
import com.nova.ai.assistant.ui.SettingsScreen
import com.nova.ai.assistant.ui.SplashScreen
import com.nova.ai.assistant.ui.YouTubeScreen
import com.nova.ai.assistant.ui.theme.CardBackground
import com.nova.ai.assistant.ui.theme.CyberCyan
import com.nova.ai.assistant.ui.theme.DarkBackground
import com.nova.ai.assistant.ui.theme.NovaAITheme
import com.nova.ai.assistant.ui.theme.TextSecondary
import com.nova.ai.assistant.viewmodel.NovaViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: NovaViewModel by viewModels()

    private var hasMicPermission by mutableStateOf(false)

    private val micPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasMicPermission = isGranted
        if (isGranted) {
            viewModel.startListening()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        hasMicPermission = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED

        setContent {
            NovaAITheme {
                var showSplash by remember { mutableStateOf(true) }
                // 0: Chat, 1: Agent Engine, 2: Apps, 3: YouTube, 4: History, 5: Settings
                var currentTab by remember { mutableStateOf(0) }
                val snackbarHostState = remember { SnackbarHostState() }
                val errorMessage by viewModel.errorMessage.collectAsState()

                LaunchedEffect(errorMessage) {
                    errorMessage?.let { msg ->
                        snackbarHostState.showSnackbar(msg)
                    }
                }

                BackHandler(enabled = !showSplash && currentTab != 0) {
                    currentTab = 0
                }

                if (showSplash) {
                    SplashScreen(
                        onSplashFinished = { showSplash = false }
                    )
                } else {
                    Scaffold(
                        containerColor = DarkBackground,
                        snackbarHost = { SnackbarHost(snackbarHostState) },
                        bottomBar = {
                            NavigationBar(
                                containerColor = CardBackground,
                                tonalElevation = 0.dp,
                                modifier = Modifier.height(64.dp)
                            ) {
                                NavigationBarItem(
                                    selected = currentTab == 0,
                                    onClick = { currentTab = 0 },
                                    icon = { Icon(Icons.Default.ChatBubbleOutline, contentDescription = "Chat") },
                                    label = { Text("Chat", fontSize = 10.sp) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = CyberCyan,
                                        selectedTextColor = CyberCyan,
                                        indicatorColor = CyberCyan.copy(alpha = 0.15f),
                                        unselectedIconColor = TextSecondary,
                                        unselectedTextColor = TextSecondary
                                    )
                                )

                                NavigationBarItem(
                                    selected = currentTab == 1,
                                    onClick = { currentTab = 1 },
                                    icon = { Icon(Icons.Default.SmartToy, contentDescription = "Agent") },
                                    label = { Text("Agent", fontSize = 10.sp) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = CyberCyan,
                                        selectedTextColor = CyberCyan,
                                        indicatorColor = CyberCyan.copy(alpha = 0.15f),
                                        unselectedIconColor = TextSecondary,
                                        unselectedTextColor = TextSecondary
                                    )
                                )

                                NavigationBarItem(
                                    selected = currentTab == 2,
                                    onClick = { currentTab = 2 },
                                    icon = { Icon(Icons.Default.Apps, contentDescription = "Apps") },
                                    label = { Text("Apps", fontSize = 10.sp) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = CyberCyan,
                                        selectedTextColor = CyberCyan,
                                        indicatorColor = CyberCyan.copy(alpha = 0.15f),
                                        unselectedIconColor = TextSecondary,
                                        unselectedTextColor = TextSecondary
                                    )
                                )

                                NavigationBarItem(
                                    selected = currentTab == 3,
                                    onClick = { currentTab = 3 },
                                    icon = { Icon(Icons.Default.PlayArrow, contentDescription = "YouTube") },
                                    label = { Text("YouTube", fontSize = 10.sp) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = Color(0xFFE50914),
                                        selectedTextColor = Color(0xFFE50914),
                                        indicatorColor = Color(0xFFE50914).copy(alpha = 0.15f),
                                        unselectedIconColor = TextSecondary,
                                        unselectedTextColor = TextSecondary
                                    )
                                )

                                NavigationBarItem(
                                    selected = currentTab == 4,
                                    onClick = { currentTab = 4 },
                                    icon = { Icon(Icons.Default.History, contentDescription = "History") },
                                    label = { Text("History", fontSize = 10.sp) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = CyberCyan,
                                        selectedTextColor = CyberCyan,
                                        indicatorColor = CyberCyan.copy(alpha = 0.15f),
                                        unselectedIconColor = TextSecondary,
                                        unselectedTextColor = TextSecondary
                                    )
                                )

                                NavigationBarItem(
                                    selected = currentTab == 5,
                                    onClick = { currentTab = 5 },
                                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                                    label = { Text("Settings", fontSize = 10.sp) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = CyberCyan,
                                        selectedTextColor = CyberCyan,
                                        indicatorColor = CyberCyan.copy(alpha = 0.15f),
                                        unselectedIconColor = TextSecondary,
                                        unselectedTextColor = TextSecondary
                                    )
                                )
                            }
                        }
                    ) { innerPadding ->
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(innerPadding)
                        ) {
                            when (currentTab) {
                                0 -> ChatScreen(
                                    viewModel = viewModel,
                                    hasMicPermission = hasMicPermission,
                                    onRequirePermission = {
                                        micPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                                    }
                                )
                                1 -> AgentDashboardScreen(
                                    viewModel = viewModel,
                                    onNavigateToChat = { currentTab = 0 }
                                )
                                2 -> AppsScreen(
                                    viewModel = viewModel,
                                    hasMicPermission = hasMicPermission,
                                    onRequirePermission = {
                                        micPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                                    }
                                )
                                3 -> YouTubeScreen(
                                    viewModel = viewModel,
                                    hasMicPermission = hasMicPermission,
                                    onRequirePermission = {
                                        micPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                                    }
                                )
                                4 -> HistoryScreen(
                                    viewModel = viewModel,
                                    onNavigateToChat = { currentTab = 0 }
                                )
                                5 -> SettingsScreen(
                                    viewModel = viewModel
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
