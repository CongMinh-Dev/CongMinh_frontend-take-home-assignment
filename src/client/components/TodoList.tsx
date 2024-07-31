import { useState, type SVGProps } from 'react'

import * as Checkbox from '@radix-ui/react-checkbox'

import { api } from '@/utils/client/api'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import * as Tabs from '@radix-ui/react-tabs';


/**
 * QUESTION 3:
 * -----------
 * A todo has 2 statuses: "pending" and "completed"
 *  - "pending" state is represented by an unchecked checkbox
 *  - "completed" state is represented by a checked checkbox, darker background,
 *    and a line-through text
 *
 * We have 2 backend apis:
 *  - (1) `api.todo.getAll`       -> a query to get all todos
 *  - (2) `api.todoStatus.update` -> a mutation to update a todo's status
 *
 * Example usage for (1) is right below inside the TodoList component. For (2),
 * you can find similar usage (`api.todo.create`) in src/client/components/CreateTodoForm.tsx
 *
 * If you use VSCode as your editor , you should have intellisense for the apis'
 * input. If not, you can find their signatures in:
 *  - (1) src/server/api/routers/todo-router.ts
 *  - (2) src/server/api/routers/todo-status-router.ts
 *
 * Your tasks are:
 *  - Use TRPC to connect the todos' statuses to the backend apis
 *  - Style each todo item to reflect its status base on the design on Figma
 *
 * Documentation references:
 *  - https://trpc.io/docs/client/react/useQuery
 *  - https://trpc.io/docs/client/react/useMutation
 *
 *
 *
 *
 *
 * QUESTION 4:
 * -----------
 * Implement UI to delete a todo. The UI should look like the design on Figma
 *
 * The backend api to delete a todo is `api.todo.delete`. You can find the api
 * signature in src/server/api/routers/todo-router.ts
 *
 * NOTES:
 *  - Use the XMarkIcon component below for the delete icon button. Note that
 *  the icon button should be accessible
 *  - deleted todo should be removed from the UI without page refresh
 *
 * Documentation references:
 *  - https://www.sarasoueidan.com/blog/accessible-icon-buttons
 *
 *
 *
 *
 *
 * QUESTION 5:
 * -----------
 * Animate your todo list using @formkit/auto-animate package
 *
 * Documentation references:
 *  - https://auto-animate.formkit.com
 */

export const TodoList = () => {
  let [isAll, setIsAll] = useState(true)
  let [isPending, setIsPending] = useState(false)
  let [isCompleted, setIsCompleted] = useState(false)

  let { data: todosAll = [] } = api.todo.getAll.useQuery({
    statuses: ['completed', 'pending'],
  })

  let { data: todosPending = [] } = api.todo.getAll.useQuery({
    statuses: ['pending'],
  })

  let { data: todosCompleted = [] } = api.todo.getAll.useQuery({
    statuses: ['completed'],
  })

  const apiContext = api.useContext()

  // update todo
  const updateTodoMutation = api.todoStatus.update.useMutation({
    onSuccess: () => {
      apiContext.todo.getAll.refetch()
    },
  })

  const handleUpdateTodo = (todoId: number, todoStatus: string) => {
    updateTodoMutation.mutate({
      todoId: todoId,
      status: todoStatus == "pending" ? 'completed' : "pending",
    });
  };

  // delete todo
  const deleteTodoMutation = api.todo.delete.useMutation({
    onSuccess: () => {
      apiContext.todo.getAll.refetch()
    },
  })

  const handleDeleteTodo = (todoId: number) => {
    deleteTodoMutation.mutate({
      id: todoId,
    });
  };

  // animate 
  const [parent] = useAutoAnimate(/* optional config */)


  return (
    <div>
      {/* Taps */}
      <Tabs.Root className="TabsRoot w-full mb-10 " defaultValue="tab1">
        <Tabs.List className="TabsList" aria-label="Manage your account">
          {/* all button */}
          <Tabs.Trigger className="TabsTrigger" value="tab1">
            <div className={`${isAll ? "bg-gray-700 text-white" : "border bg-white"} rounded-full py-3 px-6 text-sm font-bold text-center mr-2 `}
              onClick={() => {
                setIsAll(true)
                setIsPending(false)
                setIsCompleted(false)
              }}
            >
              All
            </div>
          </Tabs.Trigger>

          {/* pending button */}
          <Tabs.Trigger className="TabsTrigger" value="tab2">
            <div className={`${isPending ? "bg-gray-700 text-white" : "border bg-white"} rounded-full py-3 px-6 text-sm font-bold text-center mr-2 `}
              onClick={() => {
                setIsAll(false)
                setIsPending(true)
                setIsCompleted(false)
              }}
            >
              Pending
            </div>
          </Tabs.Trigger>

          {/* completed button */}
          <Tabs.Trigger className="TabsTrigger" value="tab3">
            <div className={`${isCompleted ? "bg-gray-700 text-white" : "border bg-white"} rounded-full py-3 px-6 text-sm font-bold text-center mr-2 `}
              onClick={() => {
                setIsAll(false)
                setIsPending(false)
                setIsCompleted(true)
              }}
            >
              Completed
            </div>
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      {/* All todos */}
      {isAll && <ul className="grid grid-cols-1 gap-y-3" ref={parent}>
        {todosAll.map((todo) => (
          <li key={todo.id}>
            <div className="flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm">
              <button onClick={() => handleUpdateTodo(todo.id, todo.status)}>

                <Checkbox.Root
                  id={String(todo.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                  checked={todo.status == "completed" ? true : false}
                >
                  <Checkbox.Indicator >
                    <CheckIcon className="h-4 w-4 text-white " />
                  </Checkbox.Indicator>
                </Checkbox.Root>
              </button>

              <label
                className={`${todo.status == "completed" ? "line-through" : ""}  block pl-3 font-medium w-full text-base truncate`}
                htmlFor={String(todo.id)}>
                {todo.body}
              </label>

              {/* delete todo */}
              <button className='p-1 rounded-12' onClick={() => {
                handleDeleteTodo(todo.id)
              }
              } >
                <XMarkIcon className='h-6 w-6' />
              </button>

            </div>
          </li>
        ))}
      </ul>}

      {/* Pending todos */}
      {isPending && <ul className="grid grid-cols-1 gap-y-3" ref={parent}>
        {todosPending.map((todo) => (
          <li key={todo.id}>
            <div className="flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm">
              <button onClick={() => handleUpdateTodo(todo.id, todo.status)}>

                <Checkbox.Root
                  id={String(todo.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                  checked={todo.status == "completed" ? true : false}
                >
                  <Checkbox.Indicator >
                    <CheckIcon className="h-4 w-4 text-white " />
                  </Checkbox.Indicator>
                </Checkbox.Root>
              </button>

              <label
                className={`${todo.status == "completed" ? "line-through" : ""}  block pl-3 font-medium w-full text-base truncate`}
                htmlFor={String(todo.id)}>
                {todo.body}
              </label>

              {/* delete todo */}
              <button className='p-1 rounded-12' onClick={() => {
                handleDeleteTodo(todo.id)
              }
              } >
                <XMarkIcon className='h-6 w-6' />
              </button>

            </div>
          </li>
        ))}
      </ul>}

      {/* Completed todos */}
      {isCompleted && <ul className="grid grid-cols-1 gap-y-3" ref={parent}>
        {todosCompleted.map((todo) => (
          <li key={todo.id}>
            <div className="flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm">
              <button onClick={() => handleUpdateTodo(todo.id, todo.status)}>

                <Checkbox.Root
                  id={String(todo.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                  checked={todo.status == "completed" ? true : false}
                >
                  <Checkbox.Indicator >
                    <CheckIcon className="h-4 w-4 text-white " />
                  </Checkbox.Indicator>
                </Checkbox.Root>
              </button>

              <label
                className={`${todo.status == "completed" ? "line-through" : ""}  block pl-3 font-medium w-full text-base truncate`}
                htmlFor={String(todo.id)}>
                {todo.body}
              </label>

              {/* delete todo */}
              <button className='p-1 rounded-12' onClick={() => {
                handleDeleteTodo(todo.id)
              }
              } >
                <XMarkIcon className='h-6 w-6' />
              </button>

            </div>
          </li>
        ))}
      </ul>}

    </div>

  )
}

const XMarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

const CheckIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}