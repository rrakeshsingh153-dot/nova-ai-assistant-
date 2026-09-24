package com.nova.ai.assistant.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nova.ai.assistant.data.ConversationSession
import com.nova.ai.assistant.ui.theme.*
import com.nova.ai.assistant.viewmodel.NovaViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun HistoryScreen(
    viewModel: NovaViewModel,
    onNavigateToChat: () -> Unit,
    modifier: Modifier = Modifier
) {
    val sessions by viewModel.sessions.collectAsState()
    val activeSessionId by viewModel.activeSessionId.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var filterMode by remember { mutableStateOf("all") } // "all", "voice", "text"

    val filteredSessions = sessions.filter { s ->
        val hasVoice = s.messages.any { it.isVoiceInput }
        val modeMatches = when (filterMode) {
            "voice" -> hasVoice
            "text" -> !hasVoice
            else -> true
        }
        val queryMatches = if (searchQuery.isBlank()) true else {
            s.title.contains(searchQuery, ignoreCase = true) ||
                    s.messages.any { it.text.contains(searchQuery, ignoreCase = true) }
        }
        modeMatches && queryMatches
    }

    val totalVoice = sessions.count { it.messages.any { m -> m.isVoiceInput } }
    val totalText = sessions.size - totalVoice

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
            Column {
                Text(
                    text = "Chat History",
                    color = TextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${sessions.size} sessions ($totalVoice voice, $totalText text)",
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }

            if (sessions.isNotEmpty()) {
                IconButton(
                    onClick = { viewModel.clearAllSessions() }
                ) {
                    Icon(
                        imageVector = Icons.Default.DeleteSweep,
                        contentDescription = "Clear All",
                        tint = RoseAlert
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Filter Pills: All / Voice / Text Only
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(CardBackground)
                .border(1.dp, CardBorder, RoundedCornerShape(12.dp))
                .padding(4.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            listOf(
                Triple("all", "All (${sessions.size})", null),
                Triple("voice", "Voice ($totalVoice)", Icons.Default.Mic),
                Triple("text", "Text ($totalText)", Icons.Default.Article)
            ).forEach { (mode, label, icon) ->
                val isSelected = filterMode == mode
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) CyberCyan.copy(alpha = 0.2f) else Color.Transparent)
                        .border(1.dp, if (isSelected) CyberCyan else Color.Transparent, RoundedCornerShape(8.dp))
                        .clickable { filterMode = mode }
                        .padding(vertical = 6.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        if (icon != null) {
                            Icon(
                                imageVector = icon,
                                contentDescription = null,
                                tint = if (isSelected) CyberCyan else TextSecondary,
                                modifier = Modifier.size(12.dp)
                            )
                        }
                        Text(
                            text = label,
                            color = if (isSelected) CyberCyan else TextSecondary,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Search bar
        TextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search conversations...", color = TextTertiary, fontSize = 12.sp) },
            leadingIcon = {
                Icon(Icons.Default.Search, contentDescription = null, tint = TextTertiary, modifier = Modifier.size(18.dp))
            },
            modifier = Modifier
                .fillMaxWidth()
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

        Spacer(modifier = Modifier.height(12.dp))

        if (filteredSessions.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    text = if (sessions.isEmpty()) "No conversations recorded yet." else "No matching conversations.",
                    color = TextSecondary,
                    fontSize = 13.sp
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredSessions, key = { it.id }) { session ->
                    val isActive = session.id == activeSessionId
                    val hasVoice = session.messages.any { it.isVoiceInput }
                    val voiceCount = session.messages.count { it.isVoiceInput }
                    val lastMsg = session.messages.lastOrNull()?.text ?: ""

                    val sdf = SimpleDateFormat("MMM d, hh:mm a", Locale.getDefault())
                    val dateString = sdf.format(Date(session.updatedAt))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(if (isActive) Color(0xFF0C1830) else CardBackground)
                            .border(
                                width = 1.dp,
                                color = if (isActive) CyberCyan else CardBorder,
                                shape = RoundedCornerShape(16.dp)
                            )
                            .clickable {
                                viewModel.selectSession(session)
                                onNavigateToChat()
                            }
                            .padding(14.dp)
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    // Visual Session Icon: Mic if voice, Article if text
                                    Box(
                                        modifier = Modifier
                                            .size(32.dp)
                                            .clip(CircleShape)
                                            .background(
                                                if (hasVoice) NeonEmerald.copy(alpha = 0.15f) else Color(0xFF0F172A)
                                            )
                                            .border(
                                                1.dp,
                                                if (hasVoice) NeonEmerald.copy(alpha = 0.4f) else CardBorder,
                                                CircleShape
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = if (hasVoice) Icons.Default.Mic else Icons.Default.Article,
                                            contentDescription = null,
                                            tint = if (hasVoice) NeonEmerald else TextSecondary,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }

                                    Column(modifier = Modifier.weight(1f)) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            Text(
                                                text = session.title,
                                                color = TextPrimary,
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                maxLines = 1
                                            )

                                            // Voice vs Text Badge
                                            if (hasVoice) {
                                                Box(
                                                    modifier = Modifier
                                                        .clip(RoundedCornerShape(6.dp))
                                                        .background(NeonEmerald.copy(alpha = 0.15f))
                                                        .border(1.dp, NeonEmerald.copy(alpha = 0.3f), RoundedCornerShape(6.dp))
                                                        .padding(horizontal = 4.dp, vertical = 2.dp)
                                                ) {
                                                    Text(
                                                        text = "Voice ($voiceCount)",
                                                        color = NeonEmerald,
                                                        fontSize = 9.sp,
                                                        fontWeight = FontWeight.Bold
                                                    )
                                                }
                                            } else {
                                                Box(
                                                    modifier = Modifier
                                                        .clip(RoundedCornerShape(6.dp))
                                                        .background(Color(0xFF1E293B))
                                                        .border(1.dp, Color(0xFF334155), RoundedCornerShape(6.dp))
                                                        .padding(horizontal = 4.dp, vertical = 2.dp)
                                                ) {
                                                    Text(
                                                        text = "Text Only",
                                                        color = TextSecondary,
                                                        fontSize = 9.sp
                                                    )
                                                }
                                            }
                                        }

                                        Text(
                                            text = "$dateString • ${session.messages.size} msgs",
                                            color = TextTertiary,
                                            fontSize = 10.sp
                                        )
                                    }
                                }

                                IconButton(
                                    onClick = { viewModel.deleteSession(session.id) },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.DeleteOutline,
                                        contentDescription = "Delete",
                                        tint = TextTertiary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }

                            if (lastMsg.isNotBlank()) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "\"$lastMsg\"",
                                    color = TextSecondary,
                                    fontSize = 11.sp,
                                    maxLines = 1,
                                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
