import {
  isoFromDateAndTime,
  addMinutes,
  localDateFromIso,
  localTimeFromIso,
} from '../../../utils/dates';

interface Props {
  startTime: string;
  endTime: string;
  onChange: (start: string, end: string) => void;
}

export default function TimeSection({ startTime, endTime, onChange }: Props) {
  const startDate = localDateFromIso(startTime);
  const startHHMM = localTimeFromIso(startTime);
  const endHHMM = localTimeFromIso(endTime);

  const handleStartDate = (date: string) => {
    const newStart = isoFromDateAndTime(date, startHHMM);
    const newEnd = isoFromDateAndTime(date, endHHMM);
    onChange(newStart, newEnd);
  };

  const handleStartTime = (time: string) => {
    const newStart = isoFromDateAndTime(startDate, time);
    const newEnd = addMinutes(newStart, 60);
    onChange(newStart, newEnd);
  };

  const handleEndTime = (time: string) => {
    onChange(startTime, isoFromDateAndTime(startDate, time));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={labelStyle}>HORÁRIO</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="date" value={startDate} onChange={e => handleStartDate(e.target.value)}
          style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="time" value={startHHMM} onChange={e => handleStartTime(e.target.value)}
          style={{ ...inputStyle, flex: 1 }} />
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>até</span>
        <input type="time" value={endHHMM} onChange={e => handleEndTime(e.target.value)}
          style={{ ...inputStyle, flex: 1 }} />
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1 };
const inputStyle: React.CSSProperties = {
  background: 'var(--card)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontSize: 14, flex: 1,
};
