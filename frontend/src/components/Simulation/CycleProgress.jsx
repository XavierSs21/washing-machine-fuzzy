import useCycleStore from '../../store/cycleSlice'

const CYCLE_ORDER = ['prelavado', 'lavado', 'enjuague', 'centrifugado']

const CYCLE_COLORS = {
  prelavado:    'bg-yellow-400',
  lavado:       'bg-blue-500',
  enjuague:     'bg-cyan-400',
  centrifugado: 'bg-purple-500',
}

const CycleProgress = () => {
  const { progress, currentCycle } = useCycleStore()

  const color = currentCycle
    ? CYCLE_COLORS[currentCycle]
    : 'bg-blue-500'

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-3">

      {/* Indicadores de ciclo */}
      <div className="flex justify-between text-xs text-gray-500">
        {CYCLE_ORDER.map((cycle) => (
          <span
            key={cycle}
            className={`font-medium capitalize transition-colors ${
              currentCycle === cycle
                ? 'text-blue-600 font-bold'
                : 'text-gray-400'
            }`}
          >
            {cycle}
          </span>
        ))}
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
        <div
          className={`${color} h-5 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {progress > 10 && (
            <span className="text-white text-xs font-bold">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      </div>

      {/* Porcentaje si la barra es muy pequeña */}
      {progress <= 10 && (
        <p className="text-right text-sm text-gray-600 font-semibold">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  )
}

export default CycleProgress
