"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Plus, Filter } from "lucide-react"

// Sample data
const sampleSales = [
  {
    id: 1,
    fecha: "2024-01-15",
    producto: "Laptop HP",
    cantidad: 2,
    precioUnitario: 1200,
    total: 2400,
    metodoPago: "Transferencia",
    evento: "Feria Tecnológica 2024",
  },
  {
    id: 2,
    fecha: "2024-01-14",
    producto: "Mouse Inalámbrico",
    cantidad: 5,
    precioUnitario: 25,
    total: 125,
    metodoPago: "Efectivo",
    evento: null,
  },
  {
    id: 3,
    fecha: "2024-01-13",
    producto: "Teclado Mecánico",
    cantidad: 1,
    precioUnitario: 150,
    total: 150,
    metodoPago: "QR",
    evento: "Expo Gaming",
  },
]

const sampleProducts = [
  "Laptop HP",
  "Mouse Inalámbrico",
  "Teclado Mecánico",
  'Monitor 24"',
  "Auriculares Bluetooth",
  "Webcam HD",
]

const sampleEvents = ["Feria Tecnológica 2024", "Expo Gaming", "Black Friday Sale", "Conferencia Tech"]

const paymentMethods = ["Efectivo", "QR", "Transferencia", "Tarjeta"]

export default function SalesRegistration() {
  const [isEventSale, setIsEventSale] = useState(false)
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false)
  const [sales, setSales] = useState(sampleSales)
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    product: "",
    paymentMethod: "all",
  })

  // Form state
  const [formData, setFormData] = useState({
    fecha: "",
    producto: "Laptop HP", // Default value set
    cantidad: "",
    precioUnitario: "",
    metodoPago: "Efectivo", // Default value set
    evento: "",
  })

  // New event form state
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    location: "",
    type: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newSale = {
      id: sales.length + 1,
      fecha: formData.fecha,
      producto: formData.producto,
      cantidad: Number.parseInt(formData.cantidad),
      precioUnitario: Number.parseFloat(formData.precioUnitario),
      total: Number.parseInt(formData.cantidad) * Number.parseFloat(formData.precioUnitario),
      metodoPago: formData.metodoPago,
      evento: isEventSale ? formData.evento : null,
    }
    setSales([newSale, ...sales])

    // Reset form
    setFormData({
      fecha: "",
      producto: "Laptop HP", // Default value set
      cantidad: "",
      precioUnitario: "",
      metodoPago: "Efectivo", // Default value set
      evento: "",
    })
    setIsEventSale(false)
  }

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the event to your backend
    console.log("Creating new event:", newEvent)
    setIsNewEventModalOpen(false)
    setNewEvent({ name: "", date: "", location: "", type: "" })
  }

  const filteredSales = sales.filter((sale) => {
    if (filters.dateFrom && sale.fecha < filters.dateFrom) return false
    if (filters.dateTo && sale.fecha > filters.dateTo) return false
    if (filters.product && !sale.producto.toLowerCase().includes(filters.product.toLowerCase())) return false
    if (filters.paymentMethod && filters.paymentMethod !== "all" && sale.metodoPago !== filters.paymentMethod)
      return false
    return true
  })

  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Sales Registration Form */}
        <Card className="shadow-sm">
          <CardHeader className="bg-card border-b border-default">
            <CardTitle className="text-2xl font-semibold text-foreground">Registrar Venta</CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-card">            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Date Picker */}
                <div className="space-y-2">
                  <Label htmlFor="fecha" className="text-sm font-medium text-foreground">
                    Fecha de la venta
                  </Label>
                  <div className="relative">
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="pl-10"
                      required
                    />
                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  </div>
                </div>

                {/* Product Select */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Producto vendido</Label>
                  <Select
                    value={formData.producto}
                    onValueChange={(value: any) => setFormData({ ...formData, producto: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleProducts.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad" className="text-sm font-medium text-foreground">
                    Cantidad vendida
                  </Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>

                {/* Unit Price */}
                <div className="space-y-2">
                  <Label htmlFor="precio" className="text-sm font-medium text-foreground">
                    Precio unitario de venta
                  </Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precioUnitario}
                    onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Método de pago</Label>
                  <Select
                    value={formData.metodoPago}
                    onValueChange={(value: any) => setFormData({ ...formData, metodoPago: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Total Display */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Total</Label>
                  <div className="px-3 py-2 bg-gray-50 border rounded-md text-lg font-semibold text-green-600">
                    $
                    {formData.cantidad && formData.precioUnitario
                      ? (Number.parseFloat(formData.cantidad) * Number.parseFloat(formData.precioUnitario)).toFixed(2)
                      : "0.00"}
                  </div>
                </div>
              </div>

              {/* Event Section */}
              <div className="border-t pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Switch id="event-sale" checked={isEventSale} onCheckedChange={setIsEventSale} />
                  <Label htmlFor="event-sale" className="text-sm font-medium text-foreground">
                    ¿Esta venta pertenece a un evento?
                  </Label>
                </div>

                {isEventSale && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-foreground">Seleccionar evento existente</Label>
                        <Select
                          value={formData.evento}
                          onValueChange={(value: any) => setFormData({ ...formData, evento: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar evento" />
                          </SelectTrigger>
                          <SelectContent>
                            {sampleEvents.map((event) => (
                              <SelectItem key={event} value={event}>
                                {event}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Dialog open={isNewEventModalOpen} onOpenChange={setIsNewEventModalOpen}>
                          <DialogTrigger asChild>
                            <Button type="button" className="flex items-center gap-2 bg-transparent border border-input">
                              <Plus className="h-4 w-4" />
                              Crear nuevo evento
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Crear Nuevo Evento</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateEvent} className="space-y-4">
                              <div>
                                <Label htmlFor="event-name">Nombre del evento</Label>
                                <Input
                                  id="event-name"
                                  value={newEvent.name}
                                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                  placeholder="Nombre del evento"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="event-date">Fecha</Label>
                                <Input
                                  id="event-date"
                                  type="date"
                                  value={newEvent.date}
                                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="event-location">Ubicación (opcional)</Label>
                                <Input
                                  id="event-location"
                                  value={newEvent.location}
                                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                  placeholder="Ubicación del evento"
                                />
                              </div>
                              <div>
                                <Label>Tipo de evento</Label>
                                <Select
                                  value={newEvent.type}
                                  onValueChange={(value: any) => setNewEvent({ ...newEvent, type: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="feria">Feria</SelectItem>
                                    <SelectItem value="exposicion">Exposición</SelectItem>
                                    <SelectItem value="conferencia">Conferencia</SelectItem>
                                    <SelectItem value="promocion">Promoción</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button type="button" className="border border-input bg-transparent" onClick={() => setIsNewEventModalOpen(false)}>
                                  Cancelar
                                </Button>
                                <Button type="submit">Crear Evento</Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="px-8 py-2 bg-blue-600 hover:bg-blue-700">
                  Registrar Venta
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sales History */}
        <Card className="shadow-sm">
          <CardHeader className="bg-card border-b border-default">
            <CardTitle className="text-2xl font-semibold text-foreground">Ventas Registradas</CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-card">            {/* Filters */}
            <div className="mb-6 p-4 bg-card rounded-lg border border-default">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-foreground">Filtros</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-gray-300">Fecha desde</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-300">Fecha hasta</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-300">Producto</Label>
                  <Input
                    placeholder="Buscar producto..."
                    value={filters.product}
                    onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-300">Método de pago</Label>
                  <Select
                    value={filters.paymentMethod}
                    onValueChange={(value: any) => setFilters({ ...filters, paymentMethod: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sales Table */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-card">
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Producto</TableHead>
                    <TableHead className="font-semibold">Cantidad</TableHead>
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className="font-semibold">Método de Pago</TableHead>
                    <TableHead className="font-semibold">Evento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{sale.fecha}</TableCell>
                      <TableCell>{sale.producto}</TableCell>
                      <TableCell>{sale.cantidad}</TableCell>
                      <TableCell className="font-semibold text-green-600">${sale.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className="text-xs">
                          {sale.metodoPago}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sale.evento ? (
                          <Badge className="text-xs">
                            {sale.evento}
                          </Badge>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredSales.length === 0 && (
              <div className="text-center py-8 text-gray-500">No se encontraron ventas con los filtros aplicados.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
