import 'react-native-get-random-values';
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateUUID(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  let result = '';
  for (let i = 0; i < 16; i++) {
    const byte = array[i];
    result += byte.toString(16).padStart(2, '0');
    
    if (i === 3 || i === 5 || i === 7 || i === 9) {
      result += '-';
    }
  }
  
  result = result.substring(0, 14) + '4' + result.substring(15);
  result = result.substring(0, 19) + '8' + result.substring(20);
  
  return result;
}

export function generateTimestampId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateLocationAlarmId(): string {
  return `loc-alarm-${generateId()}`;
}
