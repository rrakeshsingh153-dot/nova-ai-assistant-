package com.nova.ai.assistant.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.graphics.Color

val DarkBackground = Color(0xFF030712)
val CardBackground = Color(0xFF091122)
val CardBorder = Color(0x3306B6D4)
val NeonEmerald = Color(0xFF10B981)
val CyberCyan = Color(0xFF06B6D4)
val ElectricBlue = Color(0xFF3B82F6)
val PurpleAccent = Color(0xFFA855F7)
val RoseAlert = Color(0xFFF43F5E)
val TextPrimary = Color(0xFFF8FAFC)
val TextSecondary = Color(0xFF94A3B8)
val TextTertiary = Color(0xFF64748B)

val NovaColorScheme = darkColorScheme(
    primary = CyberCyan,
    onPrimary = Color.Black,
    secondary = NeonEmerald,
    onSecondary = Color.Black,
    tertiary = PurpleAccent,
    background = DarkBackground,
    onBackground = TextPrimary,
    surface = CardBackground,
    onSurface = TextPrimary,
    error = RoseAlert,
    onError = Color.White
)
