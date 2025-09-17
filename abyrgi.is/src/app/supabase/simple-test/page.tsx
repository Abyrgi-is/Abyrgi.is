"use client"

import { useEffect, useState } from "react"
import { supabaseClient } from "@/utils/supabase/supabase-library"

type Car = {
	id: string
	make?: string
	model?: string
	plate?: string
	user_id: string
	[key: string]: any
}

type UserRow = {
	id?: string
	email: string
	name?: string
	phone?: string
	[key: string]: any
}

export default function SimpleSupabaseCrudTest() {
	const [log, setLog] = useState<string[]>([])
	const [userId, setUserId] = useState<string>("")
	const [users, setUsers] = useState<UserRow[]>([])
	const [cars, setCars] = useState<Car[]>([])

	const addLine = (line: string) => setLog((prev) => [line, ...prev])

	const refreshUsers = async () => {
		const { data, error } = await supabaseClient.fetchData("Users")
		if (error) addLine(`Users fetch error: ${error.message}`)
		setUsers((data as UserRow[]) || [])
	}

	const refreshCars = async () => {
		if (!userId) return
		const { data, error } = await supabaseClient.getCarsByUser(userId, undefined, { table: "Cars", userIdColumn: "user_id" })
		if (error) addLine(`Cars fetch error: ${error.message}`)
		setCars((data as Car[]) || [])
	}

	useEffect(() => {
		refreshUsers()
	}, [])

	useEffect(() => {
		refreshCars()
	}, [userId])

	const handleCreateUser = async () => {
		const email = `test_${Math.random().toString(36).slice(2)}@example.com`
		const { data, error } = await supabaseClient.addUserToUsersTable({ email, name: "Test User" })
		if (error) return addLine(`Create user error: ${error.message}`)
		addLine(`Created Users row id=${data?.id || "unknown"} email=${data?.email}`)
		setUserId(data?.id)
		await refreshUsers()
	}

	const handleCreateCar = async () => {
		if (!userId) return addLine("Create a user first to get userId")
		const car: Partial<Car> = { user_id: userId, make: "Toyota", model: "Yaris", plate: Math.random().toString(36).slice(2, 8).toUpperCase() }
		const { data, error } = await supabaseClient.insertRow("Cars", car)
		if (error) return addLine(`Create car error: ${error.message}`)
		addLine(`Created Car id=${(data as any)?.id || "unknown"}`)
		await refreshCars()
	}

	const handleUpdateFirstCar = async () => {
		if (!cars.length) return addLine("No cars to update")
		const first = cars[0]
		const { data, error } = await supabaseClient.updateRows<Car>("Cars", { model: "Updated" }, { column: "id", value: first.id })
		if (error) return addLine(`Update car error: ${error.message}`)
		addLine(`Updated Car id=${first.id}, count=${Array.isArray(data) ? data.length : 0}`)
		await refreshCars()
	}

	const handleDeleteFirstCar = async () => {
		if (!cars.length) return addLine("No cars to delete")
		const first = cars[0]
		const { error } = await supabaseClient.deleteRows("Cars", { column: "id", value: first.id })
		if (error) return addLine(`Delete car error: ${error.message}`)
		addLine(`Deleted Car id=${first.id}`)
		await refreshCars()
	}

	return (
		<div style={{ padding: 24 }}>
			<h1>/supabase/simple-test — CRUD smoke test</h1>
			<div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
				<button onClick={handleCreateUser} style={{ padding: 8, border: "1px solid #ccc" }}>Create Users row</button>
				<button onClick={handleCreateCar} style={{ padding: 8, border: "1px solid #ccc" }}>Create Car</button>
				<button onClick={handleUpdateFirstCar} style={{ padding: 8, border: "1px solid #ccc" }}>Update First Car</button>
				<button onClick={handleDeleteFirstCar} style={{ padding: 8, border: "1px solid #ccc" }}>Delete First Car</button>
				<button onClick={refreshUsers} style={{ padding: 8, border: "1px solid #ccc" }}>Refresh Users</button>
				<button onClick={refreshCars} style={{ padding: 8, border: "1px solid #ccc" }}>Refresh Cars</button>
			</div>

			<div style={{ marginBottom: 16 }}>
				<label>UserId for car queries:&nbsp;</label>
				<input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Paste Users.id" style={{ padding: 6, border: "1px solid #ddd", width: 320 }} />
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
				<section>
					<h2>Users table</h2>
					<pre style={{ background: "#f8f8f8", padding: 12, maxHeight: 240, overflow: "auto" }}>{JSON.stringify(users, null, 2)}</pre>
				</section>
				<section>
					<h2>Cars for user</h2>
					<pre style={{ background: "#f8f8f8", padding: 12, maxHeight: 240, overflow: "auto" }}>{JSON.stringify(cars, null, 2)}</pre>
				</section>
			</div>

			<section style={{ marginTop: 16 }}>
				<h2>Log</h2>
				<ul>
					{log.map((l, i) => (
						<li key={i} style={{ fontFamily: "monospace" }}>{l}</li>
					))}
				</ul>
			</section>
		</div>
	)
}

