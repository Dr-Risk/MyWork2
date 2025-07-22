
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

/**
 * @fileoverview Custom hook for managing toast notifications.
 * 
 * @description
 * This file implements a global state management system for toast notifications,
 * heavily inspired by the `react-hot-toast` library. It allows any component to
 * programmatically trigger a toast notification without complex prop drilling or
 * context wrapping. It uses a reducer pattern and a listener system to manage
 * the state of visible toasts across the entire application.
 */

const TOAST_LIMIT = 1; // The maximum number of toasts that can be visible at once.
const TOAST_REMOVE_DELAY = 1000000; // A very long delay before removing toasts from the DOM, allowing for exit animations.

// The type definition for a single toast object within our internal state.
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// Action types for the reducer. Using a const object provides better type safety and autocompletion.
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

// A simple counter to generate unique, sequential IDs for each toast.
let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

// The type definitions for all possible actions our reducer can handle.
type Action =
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: ToasterToast["id"] }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: ToasterToast["id"] }

// The shape of our global toast state, which is just an array of toasts.
interface State {
  toasts: ToasterToast[]
}

// A Map to store timeouts for removing toasts from the DOM after they are dismissed.
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * The reducer function. It takes the current state and an action, and returns the new state.
 * This is the heart of the state management logic.
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Adds a new toast to the beginning of the array and enforces the TOAST_LIMIT.
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      // Finds a toast by its ID and updates it with new properties.
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      // Sets the `open` property of a toast to `false`, which triggers its exit animation.
      // If no toastId is provided, it dismisses all visible toasts.
      const { toastId } = action
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => addToRemoveQueue(toast.id))
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      // Removes a toast from the state completely, typically after its exit animation.
      if (action.toastId === undefined) {
        return { ...state, toasts: [] }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// A list of listener functions that will be called whenever the state changes.
const listeners: Array<(state: State) => void> = []

// The single, global state object for all toasts.
let memoryState: State = { toasts: [] }

// The dispatch function that updates the state and notifies all registered listeners.
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// The public interface for creating a new toast.
type Toast = Omit<ToasterToast, "id">

/**
 * The main function to create and display a toast.
 * @param props The properties of the toast (title, description, etc.).
 * @returns An object with the toast's ID and functions to dismiss or update it.
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return { id, dismiss, update }
}

/**
 * The custom hook that components will use to interact with the toast system.
 * It subscribes the component to state updates and provides the current list of toasts
 * and the `toast` and `dismiss` functions.
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      // Clean up the listener when the component unmounts.
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
