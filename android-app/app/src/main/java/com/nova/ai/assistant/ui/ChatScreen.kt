package com.nova.ai.assistant.ui

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
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
import com.nova.ai.assistant.agent.AgentExecutionState
import com.nova.ai.assistant.data.AssistantState
import com.nova.ai.assistant.data.ChatMessage
import com.nova.ai.assistant.ui.components.ChatBubble
import com.nova.ai.assistant.ui.components.NovaGlowingOrb
import com.nova.ai.assistant.ui.theme.*
import com.nova.ai.assistant.viewmodel.NovaViewModel

@Composable
fun ChatScreen(
    viewModel: NovaViewModel,
    onRequirePermission: () -> Unit,
    hasMicPermission: Boolean,
    modifier: Modifier = Modifier
) {
    val activeSessionId by viewModel.activeSessionId.collectAsState()
    val sessions by viewModel.sessions.collectAsState()
    val preferences by viewModel.preferences.collectAsState()
    val assistantState by viewModel.assistantState.collectAsState()
    val speakingMessageId by viewModel.speakingMessageId.collectAsState()
    val interimText by viewModel.interimText.collectAsState()
    val isListening by viewModel.isListening.collectAsState()
    val attachedImageUri by viewModel.attachedImageUri.collectAsState()
    val attachedFileUri by viewModel.attachedFileUri.collectAsState()
    val currentActiveTool by viewModel.currentActiveTool.collectAsState()
    val agentTaskStatus by viewModel.agentTaskStatus.collectAsState()

    val currentSession = sessions.find { it.id == activeSessionId }
    val messages = currentSession?.messages ?: emptyList()
    val listState = rememberLazyListState()

    var inputText by remember { mutableStateOf("") }

    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            viewModel.attachImage(uri)
        }
    }

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            viewModel.attachFile(uri)
        }
    }

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        // Top Action Header with Agent Status & Memory Indicator
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "NOVA AI",
                    color = CyberCyan,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.width(6.dp))
                // Glowing Status Dot
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(
                            when {
                                agentTaskStatus.state == AgentExecutionState.SEARCHING -> CyberCyan
                                agentTaskStatus.state == AgentExecutionState.EXECUTING_TOOL -> NeonEmerald
                                agentTaskStatus.state == AgentExecutionState.WAITING_CONFIRMATION -> RoseAlert
                                assistantState == AssistantState.LISTENING -> RoseAlert
                                assistantState == AssistantState.THINKING -> PurpleAccent
                                assistantState == AssistantState.SPEAKING -> CyberCyan
                                else -> NeonEmerald
                            }
                        )
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = when {
                        agentTaskStatus.state == AgentExecutionState.SEARCHING -> "SEARCHING WEB"
                        agentTaskStatus.state == AgentExecutionState.EXECUTING_TOOL -> "WORKING (${agentTaskStatus.activeToolName ?: "TOOL"})"
                        agentTaskStatus.state == AgentExecutionState.WAITING_CONFIRMATION -> "NEEDS CONFIRMATION"
                        assistantState == AssistantState.LISTENING -> "LISTENING"
                        assistantState == AssistantState.THINKING -> "THINKING"
                        assistantState == AssistantState.SPEAKING -> "SPEAKING"
                        else -> "READY"
                    },
                    color = when {
                        agentTaskStatus.state == AgentExecutionState.WAITING_CONFIRMATION -> RoseAlert
                        assistantState == AssistantState.LISTENING -> RoseAlert
                        assistantState == AssistantState.THINKING -> PurpleAccent
                        else -> NeonEmerald
                    },
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                // Memory Badge Indicator
                val memoryCount = preferences.structuredMemories.size
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(CardBackground)
                        .border(1.dp, CardBorder, RoundedCornerShape(12.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Bookmark,
                        contentDescription = "Memories",
                        tint = NeonEmerald,
                        modifier = Modifier.size(12.dp)
                    )
                    Text(
                        text = "$memoryCount Memories",
                        color = TextSecondary,
                        fontSize = 10.sp
                    )
                }

                // New Chat Button
                IconButton(
                    onClick = { viewModel.createNewChat() },
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(CardBackground)
                        .border(1.dp, CardBorder, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "New Chat",
                        tint = CyberCyan,
                        modifier = Modifier.size(16.dp)
                    )
                }

                // Clear Chat Option
                if (messages.isNotEmpty()) {
                    IconButton(
                        onClick = { viewModel.clearChat() },
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(CardBackground)
                            .border(1.dp, CardBorder, CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.DeleteOutline,
                            contentDescription = "Clear Chat",
                            tint = RoseAlert,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }

        // Live Agent Working / Confirmation Banner
        if (agentTaskStatus.state != AgentExecutionState.IDLE && agentTaskStatus.state != AgentExecutionState.COMPLETED) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(
                        if (agentTaskStatus.state == AgentExecutionState.WAITING_CONFIRMATION) RoseAlert.copy(alpha = 0.15f)
                        else CyberCyan.copy(alpha = 0.12f)
                    )
                    .border(
                        1.dp,
                        if (agentTaskStatus.state == AgentExecutionState.WAITING_CONFIRMATION) RoseAlert else CyberCyan.copy(alpha = 0.4f),
                        RoundedCornerShape(10.dp)
                    )
                    .padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(14.dp),
                            color = if (agentTaskStatus.state == AgentExecutionState.WAITING_CONFIRMATION) RoseAlert else CyberCyan,
                            strokeWidth = 2.dp
                        )
                        Text(
                            text = agentTaskStatus.statusMessage,
                            color = TextPrimary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    if (agentTaskStatus.state == AgentExecutionState.WAITING_CONFIRMATION) {
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            TextButton(
                                onClick = { viewModel.cancelPendingAction() },
                                contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("Cancel", color = TextSecondary, fontSize = 11.sp)
                            }
                            Button(
                                onClick = { viewModel.confirmPendingAction() },
                                colors = ButtonDefaults.buttonColors(containerColor = CyberCyan),
                                shape = RoundedCornerShape(6.dp),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text("Confirm", color = DarkBackground, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    } else {
                        IconButton(
                            onClick = { viewModel.cancelAgentTask() },
                            modifier = Modifier.size(20.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Cancel Task",
                                tint = RoseAlert,
                                modifier = Modifier.size(14.dp)
                            )
                        }
                    }
                }
            }
        }

        // Available Agent Tools Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val tools = listOf(
                Pair("Web Search", Icons.Default.Search),
                Pair("Image Analysis", Icons.Default.Image),
                Pair("File Analysis", Icons.Default.InsertDriveFile),
                Pair("Calculator", Icons.Default.Calculate),
                Pair("Content Studio", Icons.Default.AutoAwesome),
                Pair("Personal Memory", Icons.Default.Bookmark),
                Pair("Phone Apps", Icons.Default.Apps)
            )

            tools.forEach { (toolName, icon) ->
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFF0F1A2E))
                        .border(1.dp, CyberCyan.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                        .clickable {
                            when (toolName) {
                                "Image Analysis" -> imagePickerLauncher.launch("image/*")
                                "File Analysis" -> filePickerLauncher.launch("*/*")
                                "Calculator" -> viewModel.sendMessage("Calculate 125 * 85 + 450")
                                "Content Studio" -> viewModel.sendMessage("मेरे लिए एक YouTube Shorts का title बनाओ")
                                "Web Search" -> viewModel.sendMessage("इस topic की latest जानकारी खोजो: AI Voice Agents")
                                "Personal Memory" -> viewModel.sendMessage("मेरे बारे में तुम्हें क्या याद है?")
                                "Phone Apps" -> viewModel.sendMessage("फोन डायलर खोलो")
                            }
                        }
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = toolName,
                        tint = CyberCyan,
                        modifier = Modifier.size(12.dp)
                    )
                    Text(
                        text = toolName,
                        color = TextSecondary,
                        fontSize = 10.sp
                    )
                }
            }
        }

        // Messages List or Welcome Hero
        Box(modifier = Modifier.weight(1f)) {
            if (messages.isEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 24.dp, vertical = 12.dp),
                    horizontalAlignment = Alignment.CenterVertically,
                    verticalArrangement = Arrangement.Center
                ) {
                    NovaGlowingOrb(
                        state = assistantState,
                        size = 110.dp,
                        onClick = {
                            if (isListening) {
                                viewModel.stopListening()
                            } else {
                                if (hasMicPermission) {
                                    viewModel.startListening()
                                } else {
                                    onRequirePermission()
                                }
                            }
                        }
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "Hello, ${preferences.userName}",
                        color = TextPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "NOVA Personal AI Agent • Autonomous Tool Engine",
                        color = CyberCyan,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Understands Hindi, Hinglish and English. Equipped with web search, memory vault, calculator, vision, and content creation.",
                        color = TextSecondary,
                        fontSize = 11.sp,
                        lineHeight = 15.sp,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "POPULAR AGENT COMMANDS",
                        color = TextSecondary,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    val prompts = listOf(
                        "मेरे लिए एक YouTube Shorts का title बनाओ",
                        "मेरे बारे में तुम्हें क्या याद है?",
                        "इसे याद रखो: My favorite project is NOVA Voice Agent",
                        "आज के लिए content ideas दो",
                        "इस topic की latest जानकारी खोजो"
                    )

                    prompts.forEach { prompt ->
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 3.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(CardBackground)
                                .border(1.dp, CardBorder, RoundedCornerShape(10.dp))
                                .clickable { viewModel.sendMessage(prompt) }
                                .padding(horizontal = 12.dp, vertical = 7.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = prompt,
                                    color = TextPrimary,
                                    fontSize = 11.sp
                                )
                                Icon(
                                    imageVector = Icons.Default.ArrowForwardIos,
                                    contentDescription = null,
                                    tint = CyberCyan,
                                    modifier = Modifier.size(10.dp)
                                )
                            }
                        }
                    }
                }
            } else {
                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    items(messages, key = { it.id }) { message ->
                        ChatBubble(
                            message = message,
                            isSpeaking = speakingMessageId == message.id,
                            onSpeakClick = { viewModel.speakText(message.text, message.id) },
                            onStopSpeakingClick = { viewModel.stopSpeaking() },
                            onConfirmAction = { viewModel.confirmPendingAction() },
                            onCancelAction = { viewModel.cancelPendingAction() }
                        )
                    }
                }
            }
        }

        // Live Voice Interim Transcript Banner
        if (isListening) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(RoseAlert.copy(alpha = 0.15f))
                    .border(1.dp, RoseAlert.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = null,
                        tint = RoseAlert,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = if (interimText.isNotBlank()) interimText else "Listening in Hindi / Hinglish / English...",
                        color = Color.White,
                        fontSize = 12.sp,
                        fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                    )
                }
            }
        }

        // Attached Image or File Preview Bar
        if (attachedImageUri != null || attachedFileUri != null) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF101B2E))
                    .border(1.dp, CyberCyan.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = if (attachedImageUri != null) Icons.Default.Image else Icons.Default.InsertDriveFile,
                        contentDescription = "Attachment",
                        tint = CyberCyan,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (attachedImageUri != null) "Image attached for analysis" else "File attached for analysis",
                        color = TextPrimary,
                        fontSize = 11.sp
                    )
                }
                IconButton(
                    onClick = {
                        viewModel.clearAttachedImage()
                        viewModel.clearAttachedFile()
                    },
                    modifier = Modifier.size(20.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Remove attachment",
                        tint = RoseAlert,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }
        }

        // Bottom Input Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            // Attach Image Button
            IconButton(
                onClick = { imagePickerLauncher.launch("image/*") },
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(CardBackground)
                    .border(1.dp, CardBorder, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Default.AddPhotoAlternate,
                    contentDescription = "Attach Image",
                    tint = CyberCyan,
                    modifier = Modifier.size(20.dp)
                )
            }

            // Attach File Button
            IconButton(
                onClick = { filePickerLauncher.launch("*/*") },
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(CardBackground)
                    .border(1.dp, CardBorder, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Default.AttachFile,
                    contentDescription = "Attach File",
                    tint = CyberCyan,
                    modifier = Modifier.size(20.dp)
                )
            }

            // Input TextField
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = {
                    Text(
                        text = if (attachedImageUri != null) "Ask about this image..." else if (attachedFileUri != null) "Ask about this file..." else "Ask NOVA in Hindi, Hinglish, English...",
                        color = TextSecondary,
                        fontSize = 12.sp
                    )
                },
                modifier = Modifier
                    .weight(1f)
                    .heightIn(min = 44.dp, max = 100.dp),
                shape = RoundedCornerShape(22.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CyberCyan,
                    unfocusedBorderColor = CardBorder,
                    focusedContainerColor = CardBackground,
                    unfocusedContainerColor = CardBackground,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    cursorColor = CyberCyan
                ),
                maxLines = 3,
                trailingIcon = {
                    if (inputText.isNotBlank() || attachedImageUri != null || attachedFileUri != null) {
                        IconButton(
                            onClick = {
                                val text = inputText
                                inputText = ""
                                viewModel.sendMessage(text)
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = "Send",
                                tint = CyberCyan,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            )

            // Voice Mic Button
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(if (isListening) RoseAlert else CyberCyan)
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
                    imageVector = if (isListening) Icons.Default.Stop else Icons.Default.Mic,
                    contentDescription = if (isListening) "Stop Listening" else "Start Voice Input",
                    tint = DarkBackground,
                    modifier = Modifier.size(22.dp)
                )
            }
        }
    }
}
