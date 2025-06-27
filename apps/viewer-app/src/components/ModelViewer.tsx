import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import * as OBC from '@thatopen/components'
import * as THREE from 'three'

export function ModelViewer() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const containerRef = useRef<HTMLDivElement>(null)
  const componentsRef = useRef<OBC.Components | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Инициализация ThatOpen Components
    const components = new OBC.Components()
    componentsRef.current = components

    // Настройка рендерера
    const worlds = components.get(OBC.Worlds)
    const world = worlds.create<
      OBC.SimpleScene,
      OBC.SimpleCamera,
      OBC.SimpleRenderer
    >()

    world.scene = new OBC.SimpleScene(components)
    world.renderer = new OBC.SimpleRenderer(components, containerRef.current)
    world.camera = new OBC.SimpleCamera(components)

    components.init()

    // Настройка сцены
    world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10)
    world.scene.setup()

    // Добавление освещения
    const directionalLight = new THREE.DirectionalLight()
    directionalLight.position.set(5, 10, 3)
    directionalLight.intensity = 0.5
    world.scene.three.add(directionalLight)

    const ambientLight = new THREE.AmbientLight()
    ambientLight.intensity = 0.5
    world.scene.three.add(ambientLight)

    // Загрузка IFC модели (заглушка)
    loadIfcModel(components, buildingId)

    return () => {
      if (componentsRef.current) {
        componentsRef.current.dispose()
      }
    }
  }, [buildingId])

  const loadIfcModel = async (components: OBC.Components, buildingId?: string) => {
    try {
      // Здесь будет логика загрузки IFC файла
      console.log(`Загрузка модели для здания: ${buildingId}`)
      
      // Пример создания простой геометрии
      const geometry = new THREE.BoxGeometry(2, 2, 2)
      const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
      const cube = new THREE.Mesh(geometry, material)
      
      const world = components.get(OBC.Worlds).list.values().next().value
      world.scene.three.add(cube)
    } catch (error) {
      console.error('Ошибка загрузки модели:', error)
    }
  }

  return (
    <div className="h-full w-full">
      <div className="h-16 bg-white border-b flex items-center px-4">
        <h2 className="text-lg font-semibold">3D Просмотрщик - Здание {buildingId}</h2>
      </div>
      <div 
        ref={containerRef} 
        className="h-[calc(100vh-4rem)] w-full bg-gray-100"
      />
    </div>
  )
}
