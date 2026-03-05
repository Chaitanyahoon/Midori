"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"

interface DataInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DataInfoModal({ isOpen, onClose }: DataInfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-blue-50/20 border-0 shadow-2xl rounded-3xl">
        <DialogHeader className="relative pb-6">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-100/40 via-emerald-50/30 to-blue-100/20 rounded-t-3xl"></div>

          {/* Floating elements */}
          <div className="absolute top-4 right-8 w-3 h-3 bg-green-300/30 rounded-full animate-pulse"></div>
          <div
            className="absolute top-8 right-16 w-2 h-2 bg-blue-300/40 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-6 right-24 w-1.5 h-1.5 bg-emerald-300/50 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>

          <DialogTitle className="relative z-10 flex items-center space-x-4 text-2xl font-bold">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 via-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-leaf-float">
              <Icons.seedling className="w-7 h-7 text-white drop-shadow-sm" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Your Garden's Growth System
              </span>
              <p className="text-sm font-normal text-gray-600 mt-1">
                Understanding how your productivity data flourishes
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Data Storage Explanation */}
          <Card className="card-premium border-0 shadow-lg hover:shadow-xl transition-all duration-500 animate-grow-in overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-blue-50/20"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <Icons.sun className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-green-800">☁️ Cloud Garden Storage</span>
                  <p className="text-sm font-normal text-green-600 mt-1">
                    Your data grows safely in the Planthesia cloud
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="group p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-green-200/50 hover:border-green-300/50 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icons.sprout className="w-4 h-4 text-white" />
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">Secure</Badge>
                  </div>
                  <h4 className="font-semibold text-green-800 mb-2">Private & Secure</h4>
                  <p className="text-sm text-green-700 leading-relaxed">
                    Your productivity seeds are planted securely in our Firebase Cloud database, tied strictly to your authenticated account.
                  </p>
                </div>

                <div className="group p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-200/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icons.tree className="w-4 h-4 text-white" />
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">Synced</Badge>
                  </div>
                  <h4 className="font-semibold text-blue-800 mb-2">Always Growing</h4>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Your garden syncs instantly across all your devices. Plant a seed on your phone, watch it bloom on your laptop.
                  </p>
                </div>

                <div className="group p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200/50 hover:border-purple-300/50 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icons.flower className="w-4 h-4 text-white" />
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">Real-time</Badge>
                  </div>
                  <h4 className="font-semibold text-purple-800 mb-2">Live Ecosystem</h4>
                  <p className="text-sm text-purple-700 leading-relaxed">
                    When you complete a task or change a setting, your garden updates in real-time. No manual saving required.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-World Scenarios */}
          <Card
            className="card-premium border-0 shadow-lg hover:shadow-xl transition-all duration-500 animate-grow-in overflow-hidden"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 via-orange-50/30 to-red-50/20"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <Icons.target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-orange-800">🌟 Garden Scenarios</span>
                  <p className="text-sm font-normal text-orange-600 mt-1">
                    Real-world examples of how your garden syncs
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    scenario: "📱 Device Switch",
                    description: "You plant a task on your phone while commuting",
                    result: "It's waiting for you on your laptop when you get to work",
                    color: "green",
                  },
                  {
                    scenario: "🔄 Browser Switch",
                    description: "You switch from Chrome to Firefox",
                    result: "Just log in, and your entire garden is right there",
                    color: "blue",
                  },
                  {
                    scenario: "🧹 Cleared Browsing Data",
                    description: "You clear all your cookies and local storage",
                    result: "Your garden is safe in the cloud. Just log back in!",
                    color: "purple",
                  },
                  {
                    scenario: "👻 Incognito Mode",
                    description: "You log in from a library or private window",
                    result: "Your garden loads perfectly. Just ensure you log out!",
                    color: "orange",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`group p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-${item.color}-200/50 hover:border-${item.color}-300/50 transition-all duration-300 hover:shadow-md animate-grow-in`}
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  >
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <span className="mr-2">{item.scenario}</span>
                      </h4>
                      <p className="text-sm text-gray-700">{item.description}</p>
                      <div className={`p-3 bg-${item.color}-50 rounded-xl border border-${item.color}-200/50`}>
                        <p className="text-sm font-medium text-gray-800">→ {item.result}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pro Tips */}
          <Card
            className="card-premium border-0 shadow-lg hover:shadow-xl transition-all duration-500 animate-grow-in overflow-hidden"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-slate-50/30 to-blue-50/20"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-slate-700 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <Icons.sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-gray-800">💡 Gardening Pro Tips</span>
                  <p className="text-sm font-normal text-gray-600 mt-1">Expert advice for optimal garden growth</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: Icons.leaf,
                    tip: "Consistent Cultivation",
                    description:
                      "Use the same browser consistently for the best garden experience and continuous growth tracking.",
                    color: "emerald",
                  },
                  {
                    icon: Icons.sun,
                    tip: "Cross-Device Syncing",
                    description:
                      "Consider browser sync features if you want your garden to flourish across multiple devices.",
                    color: "blue",
                  },
                  {
                    icon: Icons.seedling,
                    tip: "Future Backup Seeds",
                    description: "We're cultivating export features so you can save backup seeds of your garden data.",
                    color: "purple",
                  },
                ].map((tip, index) => (
                  <div
                    key={index}
                    className={`group p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-${tip.color}-200/50 hover:border-${tip.color}-300/50 transition-all duration-300 hover:shadow-md animate-grow-in`}
                    style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br from-${tip.color}-400 to-${tip.color}-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                      >
                        <tip.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{tip.tip}</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-green-100/50 bg-gradient-to-r from-green-50/30 to-blue-50/20 rounded-b-3xl -mx-6 -mb-6 px-6 pb-6 mt-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Icons.heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Happy Gardening!</p>
              <p className="text-xs text-green-600">Your productivity garden is in good hands</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Icons.leaf className="w-4 h-4 mr-2" />
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
