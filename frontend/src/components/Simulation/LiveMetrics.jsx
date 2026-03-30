import useCycleStore from '../../store/cycleSlice'

// Etiquetas legibles por ciclo
const CYCLE_LABELS = {
  prelavado: 'Prelavado',
  lavado: 'Lavado',
  enjuague: 'Enjuague',
  centrifugado: 'Centrifugado',
}

const LiveMetrics = () => {
  const { metrics, currentCycle } = useCycleStore()
  const { temperatura_agua, velocidad_agitacion, cantidad_detergente } = metrics

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-3">
      <h2 className="text-lg font-semibold text-gray-700">
        Ciclo activo:{' '}
        <span className="text-blue-600">
          {currentCycle ? CYCLE_LABELS[currentCycle] : '—'}
        </span>
      </h2>

      <div className="grid grid-cols-3 gap-4 text-center">
        <MetricCard
          label="Temperatura"
          value={temperatura_agua}
          unit="°C"
          icon="🌡️"
        />
        <MetricCard
          label="Velocidad"
          value={velocidad_agitacion}
          unit="rpm"
          icon="⚙️"
        />
        <MetricCard
          label="Detergente"
          value={cantidad_detergente}
          unit="ml"
          icon="🧴"
        />
      </div>
    </div>
  )
}

const MetricCard = ({ label, value, unit, icon }) => (
  <div className="bg-blue-50 rounded-lg p-3">
    <p className="text-xl mb-1">{icon}</p>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-2xl font-bold text-blue-700">
      {value !== undefined && value !== null
        ? Number(value).toFixed(1)
        : '—'}
    </p>
    <p className="text-xs text-gray-400">{unit}</p>
  </div>
)

export default LiveMetrics
