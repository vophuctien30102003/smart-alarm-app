package com.pscd.smartalarmapp.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import com.baekgol.reactnativealarmmanager.db.Database
import com.baekgol.reactnativealarmmanager.util.AlarmReceiver
import java.util.Calendar

/**
 * Re-schedules persisted alarms created via react-native-alarm-manager after a device reboot.
 * This ensures alarms continue to fire even when the app process has been killed.
 */
class AlarmBootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action != Intent.ACTION_BOOT_COMPLETED && action != "android.intent.action.QUICKBOOT_POWERON") {
            return
        }

        Thread {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return@Thread
            val database = Database.getInstance(context)
            val alarms = database.alarmDao().searchAll()

            val now = Calendar.getInstance()

            alarms.forEach { alarm ->
                if (!alarm.isAlarmActivate) return@forEach

                val timeParts = alarm.alarmTime.toString().split(":")
                if (timeParts.size < 2) return@forEach

                val hour = timeParts[0].toInt()
                val minute = timeParts[1].toInt()

                val triggerCalendar = Calendar.getInstance().apply {
                    timeInMillis = now.timeInMillis
                    set(Calendar.HOUR_OF_DAY, hour)
                    set(Calendar.MINUTE, minute)
                    set(Calendar.SECOND, 0)
                    set(Calendar.MILLISECOND, 0)

                    if (before(now)) {
                        add(Calendar.DAY_OF_YEAR, 1)
                    }
                }

                val alarmIntent = Intent(context, AlarmReceiver::class.java).apply {
                    putExtra("id", alarm.alarmId)
                    putExtra("hour", hour)
                    putExtra("minute", minute)
                    putExtra("title", alarm.alarmTitle)
                    putExtra("text", alarm.alarmText)
                    putExtra("sound", alarm.alarmSound)
                    putExtra("icon", alarm.alarmIcon)
                    putExtra("soundLoop", alarm.isAlarmSoundLoop)
                    putExtra("vibration", alarm.isAlarmVibration)
                    putExtra("notiRemovable", alarm.isAlarmNotiRemovable)
                }

                val flags = PendingIntent.FLAG_CANCEL_CURRENT or
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0

                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    alarm.alarmId,
                    alarmIntent,
                    flags
                )

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerCalendar.timeInMillis, pendingIntent)
                } else {
                    alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerCalendar.timeInMillis, pendingIntent)
                }
            }
        }.start()
    }
}
