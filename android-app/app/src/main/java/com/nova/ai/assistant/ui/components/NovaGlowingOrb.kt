package com.nova.ai.assistant.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.nova.ai.assistant.data.AssistantState
import com.nova.ai.assistant.ui.theme.CyberCyan
import com.nova.ai.assistant.ui.theme.ElectricBlue
import com.nova.ai.assistant.ui.theme.NeonEmerald
import com.nova.ai.assistant.ui.theme.PurpleAccent
import com.nova.ai.assistant.ui.theme.RoseAlert

@Composable
fun NovaGlowingOrb(
    state: AssistantState,
    modifier: Modifier = Modifier,
    size: Dp = 140.dp,
    onClick: () -> Unit = {}
) {
    val infiniteTransition = rememberInfiniteTransition(label = "orb_anim")

    // Pulse animation based on state
    val duration = when (state) {
        AssistantState.LISTENING -> 800
        AssistantState.THINKING -> 1200
        AssistantState.SPEAKING -> 600
        AssistantState.IDLE -> 2400
    }

    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(duration, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(6000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    val primaryColor = when (state) {
        AssistantState.LISTENING -> RoseAlert
        AssistantState.THINKING -> PurpleAccent
        AssistantState.SPEAKING -> NeonEmerald
        AssistantState.IDLE -> CyberCyan
    }

    val secondaryColor = when (state) {
        AssistantState.LISTENING -> PurpleAccent
        AssistantState.THINKING -> CyberCyan
        AssistantState.SPEAKING -> ElectricBlue
        AssistantState.IDLE -> NeonEmerald
    }

    Box(
        modifier = modifier
            .size(size)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = onClick
            ),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(size)) {
            val center = this.center
            val baseRadius = size.toPx() / 2f * 0.7f

            // Outer Aura Glow
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        primaryColor.copy(alpha = 0.35f),
                        secondaryColor.copy(alpha = 0.15f),
                        Color.Transparent
                    ),
                    center = center,
                    radius = baseRadius * 1.5f * pulseScale
                ),
                radius = baseRadius * 1.5f * pulseScale,
                center = center
            )

            // Outer Orbital Ring
            drawCircle(
                color = primaryColor.copy(alpha = 0.4f),
                radius = baseRadius * 1.15f * pulseScale,
                center = center,
                style = Stroke(width = 2.dp.toPx())
            )

            // Inner Core
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.9f),
                        primaryColor,
                        secondaryColor.copy(alpha = 0.8f)
                    ),
                    center = center,
                    radius = baseRadius * 0.9f
                ),
                radius = baseRadius * 0.8f * pulseScale,
                center = center
            )
        }
    }
}
