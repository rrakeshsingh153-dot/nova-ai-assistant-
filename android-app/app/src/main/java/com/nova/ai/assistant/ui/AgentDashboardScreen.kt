package com.nova.ai.assistant.ui

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nova.ai.assistant.agent.AgentExecutionState
import com.nova.ai.assistant.agent.AgentTaskStatus
import com.nova.ai.assistant.ui.theme.*
import com.nova.ai.assistant.viewmodel.NovaViewModel

@Composable
fun AgentDashboardScreen(
    viewModel: NovaViewModel,
    onNavigateToChat: () -> Unit,
    modifier: Modifier = Modifier
) {
    val taskStatus by viewModel.agentTaskStatus.collectAsState()
    val preferences by viewModel.preferences.collectAsState()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "NOVA Agent Engine",
                        color = TextPrimary,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Autonomous tool loop, memory, vision & device action",
                        color = CyberCyan,
                        fontSize = 12.sp
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(CardBackground)
                        .border(1.dp, CardBorder, RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "v2.5 Autonomous",
                        color = NeonEmerald,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }

        // Live Task Progress Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CardBackground),
                border = androidx.compose.foundation.BorderStroke(1.dp, if (taskStatus.state != AgentExecutionState.IDLE) CyberCyan else CardBorder),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = when (taskStatus.state) {
                                    AgentExecutionState.SEARCHING -> Icons.Default.Search
                                    AgentExecutionState.THINKING, AgentExecutionState.UNDERSTANDING -> Icons.Default.Psychology
                                    AgentExecutionState.EXECUTING_TOOL -> Icons.Default.Build
                                    AgentExecutionState.WAITING_CONFIRMATION -> Icons.Default.Warning
                                    AgentExecutionState.COMPLETED -> Icons.Default.CheckCircle
                                    else -> Icons.Default.SmartToy
                                },
                                contentDescription = null,
                                tint = when (taskStatus.state) {
                                    AgentExecutionState.SEARCHING -> CyberCyan
                                    AgentExecutionState.EXECUTING_TOOL -> NeonEmerald
                                    AgentExecutionState.WAITING_CONFIRMATION -> RoseAlert
                                    AgentExecutionState.COMPLETED -> NeonEmerald
                                    else -> CyberCyan
                                },
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "CURRENT TASK",
                                color = TextSecondary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                        }

                        if (taskStatus.state != AgentExecutionState.IDLE && taskStatus.state != AgentExecutionState.COMPLETED) {
                            OutlinedButton(
                                onClick = { viewModel.cancelAgentTask() },
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = RoseAlert),
                                border = androidx.compose.foundation.BorderStroke(1.dp, RoseAlert.copy(alpha = 0.5f)),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                modifier = Modifier.height(28.dp)
                            ) {
                                Text("Cancel Task", fontSize = 10.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = taskStatus.taskTitle,
                        color = TextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Status: ",
                            color = TextSecondary,
                            fontSize = 12.sp
                        )
                        Text(
                            text = taskStatus.statusMessage,
                            color = when (taskStatus.state) {
                                AgentExecutionState.WAITING_CONFIRMATION -> RoseAlert
                                AgentExecutionState.COMPLETED -> NeonEmerald
                                else -> CyberCyan
                            },
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    if (taskStatus.activeToolName != null) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Tool in Use: ${taskStatus.activeToolName}",
                            color = NeonEmerald,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Progress indicator
                    LinearProgressIndicator(
                        progress = { taskStatus.progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = CyberCyan,
                        trackColor = Color(0xFF131D31)
                    )

                    // User Confirmation Dialog / Buttons if state is WAITING_CONFIRMATION
                    if (taskStatus.state == AgentExecutionState.WAITING_CONFIRMATION) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Card(
                            colors = CardDefaults.cardColors(containerColor = RoseAlert.copy(alpha = 0.15f)),
                            border = androidx.compose.foundation.BorderStroke(1.dp, RoseAlert),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = "क्या मैं यह काम कर दूँ?",
                                    color = RoseAlert,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = taskStatus.confirmationPrompt ?: "An external device action requires your confirmation.",
                                    color = TextPrimary,
                                    fontSize = 12.sp
                                )
                                Spacer(modifier = Modifier.height(10.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.End
                                ) {
                                    OutlinedButton(
                                        onClick = { viewModel.cancelPendingAction() },
                                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextSecondary),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text("Cancel", fontSize = 11.sp)
                                    }
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Button(
                                        onClick = { viewModel.confirmPendingAction() },
                                        colors = ButtonDefaults.buttonColors(containerColor = CyberCyan),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text("Confirm (हाँ, करो)", color = DarkBackground, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }

                    // Result summary if completed
                    if (!taskStatus.resultSummary.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF0F1B2F))
                                .padding(10.dp)
                        ) {
                            Column {
                                Text(
                                    text = "Execution Result:",
                                    color = CyberCyan,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = taskStatus.resultSummary ?: "",
                                    color = TextPrimary,
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                }
            }
        }

        // Modular Tools Registry Status
        item {
            Text(
                text = "REGISTERED AGENT TOOLS",
                color = TextSecondary,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
        }

        val registeredTools = listOf(
            Triple("WebSearchTool", "Searches verified web grounding for latest info, weather & news", Icons.Default.Search),
            Triple("CalculatorTool", "Evaluates accurate mathematical expressions and computations", Icons.Default.Calculate),
            Triple("ContentCreatorTool", "Generates high CTR YouTube titles, hooks, hashtags and scripts", Icons.Default.AutoAwesome),
            Triple("ImageAnalysisTool", "Performs visual intelligence and object recognition on images", Icons.Default.Image),
            Triple("FileAnalysisTool", "Parses and summarizes user-selected files and documents", Icons.Default.InsertDriveFile),
            Triple("AndroidActionTool", "Launches supported device features with strict confirmation protection", Icons.Default.SettingsPhone),
            Triple("MemoryTool", "Manages local persistent memories, preferences, and user context", Icons.Default.Bookmark)
        )

        items(registeredTools.size) { index ->
            val (name, desc, icon) = registeredTools[index]
            val isCurrentlyActive = taskStatus.activeToolName == name

            Card(
                colors = CardDefaults.cardColors(containerColor = if (isCurrentlyActive) CyberCyan.copy(alpha = 0.12f) else CardBackground),
                border = androidx.compose.foundation.BorderStroke(1.dp, if (isCurrentlyActive) CyberCyan else CardBorder),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(if (isCurrentlyActive) CyberCyan else Color(0xFF131F33)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = icon,
                            contentDescription = name,
                            tint = if (isCurrentlyActive) DarkBackground else CyberCyan,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = name,
                                color = TextPrimary,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                            if (isCurrentlyActive) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "ACTIVE",
                                    color = NeonEmerald,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                        Text(
                            text = desc,
                            color = TextSecondary,
                            fontSize = 11.sp
                        )
                    }

                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "Ready",
                        tint = NeonEmerald,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }

        // Quick Launch Actions
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Button(
                onClick = onNavigateToChat,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(46.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CyberCyan),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.ChatBubble,
                    contentDescription = null,
                    tint = DarkBackground,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Open Conversation Console",
                    color = DarkBackground,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
