package com.nova.ai.assistant.ui

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.AlarmClock
import android.provider.MediaStore
import android.provider.Settings
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nova.ai.assistant.ui.theme.*
import com.nova.ai.assistant.viewmodel.NovaViewModel

data class AndroidAppItem(
    val id: String,
    val nameEn: String,
    val nameHi: String,
    val category: String,
    val icon: ImageVector,
    val primaryColor: Color,
    val description: String,
    val action: (Context) -> Unit
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppsScreen(
    viewModel: NovaViewModel,
    hasMicPermission: Boolean,
    onRequirePermission: () -> Unit
) {
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }

    val appList = remember {
        listOf(
            AndroidAppItem(
                id = "phone",
                nameEn = "Phone / Dialer",
                nameHi = "फोन डायलर",
                category = "Daily",
                icon = Icons.Default.Phone,
                primaryColor = Color(0xFF10B981),
                description = "Make quick phone calls"
            ) { ctx ->
                try {
                    val intent = Intent(Intent.ACTION_DIAL)
                    ctx.startActivity(intent)
                } catch (e: Exception) {
                    // Ignored
                }
            },
            AndroidAppItem(
                id = "whatsapp",
                nameEn = "WhatsApp",
                nameHi = "व्हाट्सएप",
                category = "Social",
                icon = Icons.Default.Chat,
                primaryColor = Color(0xFF25D366),
                description = "Chat & calls"
            ) { ctx ->
                try {
                    val intent = ctx.packageManager.getLaunchIntentForPackage("com.whatsapp")
                    if (intent != null) ctx.startActivity(intent)
                    else {
                        val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://web.whatsapp.com"))
                        ctx.startActivity(webIntent)
                    }
                } catch (e: Exception) {
                    val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://web.whatsapp.com"))
                    ctx.startActivity(webIntent)
                }
            },
            AndroidAppItem(
                id = "youtube",
                nameEn = "YouTube",
                nameHi = "यूट्यूब",
                category = "Media",
                icon = Icons.Default.PlayArrow,
                primaryColor = Color(0xFFE50914),
                description = "Watch songs & videos"
            ) { ctx ->
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("vnd.youtube:"))
                    ctx.startActivity(intent)
                } catch (e: Exception) {
                    ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://youtube.com")))
                }
            },
            AndroidAppItem(
                id = "maps",
                nameEn = "Google Maps",
                nameHi = "गूगल मैप्स",
                category = "Google",
                icon = Icons.Default.LocationOn,
                primaryColor = Color(0xFF3B82F6),
                description = "Live GPS & Navigation"
            ) { ctx ->
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q="))
                    ctx.startActivity(intent)
                } catch (e: Exception) {
                    ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://maps.google.com")))
                }
            },
            AndroidAppItem(
                id = "camera",
                nameEn = "Camera",
                nameHi = "कैमरा",
                category = "Tools",
                icon = Icons.Default.CameraAlt,
                primaryColor = Color(0xFFA855F7),
                description = "Take photos & videos"
            ) { ctx ->
                try {
                    val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                    ctx.startActivity(intent)
                } catch (e: Exception) {
                    // Fallback
                }
            },
            AndroidAppItem(
                id = "calculator",
                nameEn = "Calculator",
                nameHi = "कैलकुलेटर",
                category = "Tools",
                icon = Icons.Default.Calculate,
                primaryColor = Color(0xFFF59E0B),
                description = "Math & calculations"
            ) { ctx ->
                try {
                    val intent = Intent()
                    intent.setAction(Intent.ACTION_MAIN)
                    intent.addCategory(Intent.CATEGORY_APP_CALCULATOR)
                    ctx.startActivity(intent)
                } catch (e: Exception) {
                    // Fallback
                }
            },
            AndroidAppItem(
                id = "messages",
                nameEn = "Messages / SMS",
                nameHi = "एसएमएस मैसेज",
                category = "Daily",
                icon = Icons.Default.Email,
                primaryColor = Color(0xFF06B6D4),
                description = "Send text messages"
            ) { ctx ->
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("sms:"))
                    ctx.startActivity(intent)
                } catch (e: Exception) {
                    // Fallback
                }
            },
            AndroidAppItem(
                id = "gmail",
                nameEn = "Gmail",
                nameHi = "जीमेल",
                category = "Google",
                icon = Icons.Default.MailOutline,
                primaryColor = Color(0xFFEA4335),
                description = "Send and read emails"
            ) { ctx ->
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("mailto:"))
                    ctx.startActivity(intent)
                } catch (e: Exception) {
                    // Fallback
                }
            },
            AndroidAppItem(
                id = "browser",
                nameEn = "Chrome Browser",
                nameHi = "गूगल क्रोम",
                category = "Google",
                icon = Icons.Default.Language,
                primaryColor = Color(0xFF4285F4),
                description = "Browse the internet"
            ) { ctx ->
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://google.com"))
                    ctx.startActivity(intent)
                } catch (e: Exception) {
                    // Fallback
                }
            },
            AndroidAppItem(
                id = "clock",
                nameEn = "Clock & Alarm",
                nameHi = "घड़ी और अलार्म",
                category = "Daily",
                icon = Icons.Default.Schedule,
                primaryColor = Color(0xFF6366F1),
                description = "Set alarms & timer"
            ) { ctx ->
                try {
                    val intent = Intent(AlarmClock.ACTION_SHOW_ALARMS)
                    ctx.startActivity(intent)
                } catch (e: Exception) {
                    // Fallback
                }
            },
            AndroidAppItem(
                id = "gallery",
                nameEn = "Gallery & Photos",
                nameHi = "फोटो गैलरी",
                category = "Media",
                icon = Icons.Default.PhotoLibrary,
                primaryColor = Color(0xFFEC4899),
                description = "View photos & media"
            ) { ctx ->
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("content://media/internal/images/media"))
                    ctx.startActivity(intent)
                } catch (e: Exception) {
                    ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://photos.google.com")))
                }
            },
            AndroidAppItem(
                id = "settings",
                nameEn = "System Settings",
                nameHi = "फोन सेटिंग्स",
                category = "Tools",
                icon = Icons.Default.Settings,
                primaryColor = Color(0xFF94A3B8),
                description = "Wi-Fi, Bluetooth & display"
            ) { ctx ->
                try {
                    ctx.startActivity(Intent(Settings.ACTION_SETTINGS))
                } catch (e: Exception) {
                    // Fallback
                }
            }
        )
    }

    val filteredApps = remember(searchQuery, selectedCategory, appList) {
        appList.filter { item ->
            val matchesCategory = (selectedCategory == "All") || (item.category == selectedCategory)
            val matchesQuery = searchQuery.isBlank() ||
                    item.nameEn.contains(searchQuery, ignoreCase = true) ||
                    item.nameHi.contains(searchQuery, ignoreCase = true) ||
                    item.description.contains(searchQuery, ignoreCase = true)
            matchesCategory && matchesQuery
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Mobile Phone Apps",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "फोन के सभी ऐप्स: कॉल, व्हाट्सएप, मैप्स और टूल्स",
                    fontSize = 11.sp,
                    color = CyberCyan
                )
            }
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(CyberCyan.copy(alpha = 0.15f))
                    .border(1.dp, CyberCyan.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "12 Native Apps",
                    fontSize = 11.sp,
                    color = CyberCyan,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Search Field
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Search phone apps (कॉल, कैमरा, व्हाट्सएप)...", fontSize = 13.sp, color = TextSecondary) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = CyberCyan) },
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = CyberCyan,
                unfocusedBorderColor = CardBackground,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary
            ),
            shape = RoundedCornerShape(14.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Category Pills
        val categories = listOf("All", "Daily", "Google", "Social", "Tools", "Media")
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            categories.forEach { cat ->
                val isSelected = selectedCategory == cat
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (isSelected) CyberCyan else CardBackground)
                        .clickable { selectedCategory = cat }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = cat,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSelected) DarkBackground else TextSecondary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Grid of Apps
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.fillMaxSize(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(filteredApps) { app ->
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(CardBackground)
                        .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(16.dp))
                        .clickable { app.action(context) }
                        .padding(12.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(app.primaryColor),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = app.icon,
                                contentDescription = app.nameEn,
                                tint = Color.White,
                                modifier = Modifier.size(26.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = app.nameEn,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            textAlign = TextAlign.Center
                        )

                        Text(
                            text = app.nameHi,
                            fontSize = 11.sp,
                            color = TextSecondary,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "Open App",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = CyberCyan
                        )
                    }
                }
            }
        }
    }
}
