import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function CustomDatePicker({ value, onChange, isMobile, fontFamily }: any) {
  const [show, setShow] = useState(false);

  const formattedValue = value ? value.replace(/\//g, '-') : '';

  if (Platform.OS === 'web') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Ionicons name="calendar-outline" size={isMobile ? 14 : 18} color={value ? '#06b6d4' : '#64748b'} />
        {/* @ts-ignore */}
        <input
          type="date"
          value={formattedValue}
          onChange={(e: any) => {
            const val = e.target.value;
            if (val) {
              onChange(val.replace(/-/g, '/'));
            } else {
              onChange('');
            }
          }}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: value ? 'white' : '#64748b',
            fontFamily: fontFamily || 'inherit',
            fontSize: isMobile ? 13 : 14,
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: isMobile ? 4 : 8,
            paddingBottom: isMobile ? 4 : 8,
            colorScheme: 'dark'
          }}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChange('')} style={{ paddingLeft: 4 }}>
            <Ionicons name="close-circle" size={isMobile ? 16 : 20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <Ionicons name="calendar-outline" size={isMobile ? 14 : 18} color={value ? '#06b6d4' : '#64748b'} />
      <TouchableOpacity onPress={() => setShow(true)} style={{ flex: 1, paddingVertical: isMobile ? 4 : 8, paddingHorizontal: 8 }}>
        <Text style={{ color: value ? 'white' : '#64748b', fontSize: isMobile ? 13 : 14, fontFamily }}>
          {value || 'YYYY/MM/DD'}
        </Text>
      </TouchableOpacity>
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')} style={{ paddingLeft: 4 }}>
          <Ionicons name="close-circle" size={isMobile ? 16 : 20} color="#64748b" />
        </TouchableOpacity>
      )}
      {show && (
        <DateTimePicker
          value={value ? new Date(value.replace(/\//g, '-')) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShow(Platform.OS === 'ios');
            if (selectedDate) {
              const yyyy = selectedDate.getFullYear();
              const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const dd = String(selectedDate.getDate()).padStart(2, '0');
              onChange(`${yyyy}/${mm}/${dd}`);
            }
          }}
        />
      )}
    </View>
  );
}
