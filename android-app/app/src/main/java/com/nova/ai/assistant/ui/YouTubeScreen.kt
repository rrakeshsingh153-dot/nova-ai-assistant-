package com.nova.ai.assistant.ui

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nova.ai.assistant.ui.theme.*
import com.nova.ai.assistant.viewmodel.NovaViewModel

data class AndroidYouTubeTrack(
    val id: String,
    val title: String,
    val artist: String,
    val category: String,
    val videoId: String,
    val duration: String
)

val CURATED_TRACKS = listOf(
    AndroidYouTubeTrack("1", "Kesariya - Brahmāstra", "Arijit Singh, Pritam", "Hindi", "BddP6PYo2gs", "4:28"),
    AndroidYouTubeTrack("2", "Shree Hanuman Chalisa", "Hariharan, Gulshan Kumar", "Devotional", "AETFvQonfV8", "9:42"),
    AndroidYouTubeTrack("3", "Tum Hi Ho - Aashiqui 2", "Arijit Singh", "Hindi", "Umqb9KENgmk", "4:22"),
    AndroidYouTubeTrack("4", "Lofi Beats to Relax / Study", "Lofi Girl (Chill)", "Lofi", "jfKfPfyJRdk", "Live"),
    AndroidYouTubeTrack("5", "Khalasi - Coke Studio Bharat", "Aditya Gadhvi, Achint", "Trending", "t7wSjy9bvTU", "4:15"),
    AndroidYouTubeTrack("6", "Python Full Course for Beginners", "Programming with Mosh", "Tech", "_uQrJ0TkZlc", "1:00:00")
)

fun launchYouTube(context: Context, videoId: String?, query: String?) {
    val intent = if (!videoId.isNullOrBlank()) {
        try {
            Intent(Intent.ACTION_VIEW, Uri.parse("vnd.youtube:$videoId"))
        } catch (_: ActivityNotFoundException) {
            Intent(Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com/watch?v=$videoId"))
        }
    } else {
        val safeQuery = Uri.encode(query ?: "Trending Hindi Songs")
        Intent(Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com/results?search_query=$safeQuery"))
    }
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    try {
        context.startActivity(intent)
    } catch (_: Exception) {}
}

@Composable
fun YouTubeScreen(
    viewModel: NovaViewModel,
    onRequirePermission: () -> Unit,
    hasMicPermission: Boolean,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }
    val isListening by viewModel.isListening.collectAsState()

    val categories = listOf("All", "Hindi", "Devotional", "Lofi", "Tech", "Trending")

    val filteredList = remember(searchQuery, selectedCategory) {
        CURATED_TRACKS.filter { track ->
            val matchesCategory = selectedCategory == "All" || track.category.equals(selectedCategory, ignoreCase = true)
            val matchesQuery = searchQuery.isBlank() ||
                    track.title.contains(searchQuery, ignoreCase = true) ||
                    track.artist.contains(searchQuery, ignoreCase = true)
            matchesCategory && matchesQuery
        }
    }

    Column(
        modifier = modifier
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
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFE50914)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = "YouTube",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Column {
                    Text(
                        text = "NOVA YouTube Hub",
                        color = TextPrimary,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Hindi Music, Bhajans, Podcasts & Tutorials",
                        color = TextSecondary,
                        fontSize = 11.sp
                    )
                }
            }

            IconButton(
                onClick = { launchYouTube(context, null, searchQuery.ifBlank { "Trending" }) }
            ) {
                Icon(
                    imageVector = Icons.Default.OpenInNew,
                    contentDescription = "Open App",
                    tint = RoseAlert
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Search Bar with Mic
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search songs, bhajan, artist...", color = TextTertiary, fontSize = 12.sp) },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = null, tint = TextTertiary, modifier = Modifier.size(18.dp))
                },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = CardBackground,
                    unfocusedContainerColor = CardBackground,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent
                ),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            // Mic button
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (isListening) RoseAlert else CardBackground)
                    .border(1.dp, if (isListening) RoseAlert else CardBorder, RoundedCornerShape(12.dp))
                    .clickable {
                        if (isListening) {
                            viewModel.stopListening()
                        } else {
                            if (hasMicPermission) {
                                viewModel.startListening()
                            } else {
                                onRequirePermission()
                            }
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Mic,
                    contentDescription = "Voice Search",
                    tint = if (isListening) Color.White else CyberCyan,
                    modifier = Modifier.size(20.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Category Pills
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(categories) { cat ->
                val isSelected = selectedCategory == cat
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) Color(0xFFE50914) else CardBackground)
                        .border(1.dp, if (isSelected) Color(0xFFE50914) else CardBorder, RoundedCornerShape(8.dp))
                        .clickable { selectedCategory = cat }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = cat,
                        color = if (isSelected) Color.White else TextSecondary,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Featured Play Banner
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF130914))
                .border(1.dp, RoseAlert.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
                .clickable { launchYouTube(context, "BddP6PYo2gs", "Kesariya Brahmastra") }
                .padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFE50914)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null, tint = Color.White)
                    }
                    Column {
                        Text("Trending Now: Kesariya", color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text("Arijit Singh • Tap to Play on YouTube", color = TextSecondary, fontSize = 10.sp)
                    }
                }
                Icon(Icons.Default.ArrowForward, contentDescription = null, tint = RoseAlert, modifier = Modifier.size(16.dp))
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = "Curated Tracks & Tutorials (${filteredList.size})",
            color = TextSecondary,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Track list
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(filteredList, key = { it.id }) { track ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(CardBackground)
                        .border(1.dp, CardBorder, RoundedCornerShape(12.dp))
                        .clickable { launchYouTube(context, track.videoId, track.title) }
                        .padding(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF0F172A))
                                    .border(1.dp, CardBorder, RoundedCornerShape(8.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.PlayArrow, contentDescription = null, tint = RoseAlert, modifier = Modifier.size(18.dp))
                            }

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = track.title,
                                    color = TextPrimary,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    maxLines = 1
                                )
                                Text(
                                    text = "${track.artist} • ${track.category} • ${track.duration}",
                                    color = TextTertiary,
                                    fontSize = 10.sp
                                )
                            }
                        }

                        Icon(
                            imageVector = Icons.Default.OpenInNew,
                            contentDescription = "Play",
                            tint = CyberCyan,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}
