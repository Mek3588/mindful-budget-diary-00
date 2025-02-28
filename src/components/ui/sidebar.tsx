
import * as React from "react"
import { MenuIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

interface SidebarContextType {
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  mobileExpanded: boolean
  setMobileExpanded: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContext = React.createContext<SidebarContextType>({
  expanded: true,
  setExpanded: () => undefined,
  mobileExpanded: false,
  setMobileExpanded: () => undefined,
})

function SidebarProvider({ children }: React.PropsWithChildren) {
  const [expanded, setExpanded] = React.useState(true)
  const [mobileExpanded, setMobileExpanded] = React.useState(false)

  return (
    <SidebarContext.Provider
      value={{
        expanded,
        setExpanded,
        mobileExpanded,
        setMobileExpanded,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

function useSidebar() {
  return React.useContext(SidebarContext)
}

function SidebarTrigger() {
  const isMobile = useMobile()
  const { expanded, setExpanded, mobileExpanded, setMobileExpanded } =
    useSidebar()

  return (
    <Button
      variant="outline"
      size="icon"
      className="flex size-8 shrink-0 md:hidden"
      onClick={() => {
        isMobile
          ? setMobileExpanded(!mobileExpanded)
          : setExpanded(!expanded)
      }}
    >
      <MenuIcon className="size-4" />
    </Button>
  )
}

function Sidebar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const isMobile = useMobile()
  const { expanded, mobileExpanded } = useSidebar()

  if (isMobile) {
    return (
      <div className={cn("fixed inset-0 z-50", !mobileExpanded && "hidden")}>
        <div className="opacity-0.3 absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div
          className={cn(
            "group absolute inset-y-0 left-0 flex max-w-xs flex-col bg-sidebar-background border-r border-sidebar-border shadow-lg",
            className
          )}
          {...props}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "sticky inset-y-0 left-0 h-screen border-r bg-sidebar-background group border-sidebar-border flex-shrink-0",
        className,
        expanded ? "w-64" : "w-[70px]"
      )}
      {...props}
    />
  )
}

function SidebarHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const isMobile = useMobile()
  const { expanded, setExpanded, mobileExpanded, setMobileExpanded } =
    useSidebar()

  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex h-[52px] items-center justify-between border-b border-sidebar-border bg-sidebar-background px-4 py-2",
        className
      )}
      {...props}
    >
      {children || (
        <div className="flex items-center justify-between gap-2 w-full">
          <div
            className={cn("overflow-hidden transition-all", {
              "w-auto": expanded,
              "w-0": !expanded,
            })}
          >
            {expanded && <span className="text-lg font-semibold">Sidebar</span>}
          </div>
          {isMobile ? (
            <Button
              variant="outline"
              size="icon"
              className="flex size-8 shrink-0"
              onClick={() => setMobileExpanded(false)}
            >
              <XIcon className="size-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="flex size-8 shrink-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <XIcon className="size-4" />
              ) : (
                <MenuIcon className="size-4" />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function SidebarContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col overflow-hidden p-4 pt-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function SidebarFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-[52px] items-center border-t border-sidebar-border bg-sidebar-background p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function SidebarGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("py-2", className)} {...props}>
      {children}
    </div>
  )
}

function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = useSidebar()

  return (
    <div
      className={cn(
        "mb-2 text-xs font-medium text-sidebar-foreground/50",
        {
          hidden: !expanded,
        },
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />
}

function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />
}

function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />
}

function SidebarMenuButton({
  className,
  children,
  asChild,
  ...props
}: {
  asChild?: boolean
  className?: string
  children: React.ReactNode
}) {
  const Comp = asChild ? React.Fragment : "button"
  const { expanded } = useSidebar()

  return (
    <Comp
      className={cn(
        "flex items-center gap-2 w-full rounded-lg p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
        {
          "justify-center": !expanded,
        },
        className
      )}
      {...(asChild ? {} : props)}
    >
      <>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (child.type === "span") {
              return expanded ? (
                <span {...child.props} />
              ) : (
                <span className="sr-only" {...child.props} />
              )
            }
            return child
          }
          return expanded ? child : null
        })}
      </>
    </Comp>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarContext,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
