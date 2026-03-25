"use client";

import React from 'react';
import { CheckCircle, Download, Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceRequest } from '@/lib/types';

interface ReceiptModalProps {
  request: ServiceRequest;
  driverName?: string;
  clientName?: string;
  onClose: () => void;
}

const BASE_FARE = 15;
const PER_KM_RATE = 1.5;
const SERVICE_FEE_RATE = 0.10; // 10% service fee

function calculateReceipt(request: ServiceRequest) {
  const distance = 10; // km (estimated for MVP)
  const rideFare = BASE_FARE + PER_KM_RATE * distance;
  const serviceFee = rideFare * SERVICE_FEE_RATE;
  const subtotal = rideFare;
  const total = subtotal + serviceFee;

  return {
    distance,
    rideFare: Math.round(rideFare * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function ReceiptModal({ request, driverName, clientName, onClose }: ReceiptModalProps) {
  const receipt = calculateReceipt(request);
  const receiptNumber = `AW-${request.id.slice(0, 8).toUpperCase()}`;
  const date = new Date(request.completedAt || request.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const time = new Date(request.completedAt || request.createdAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0a111a] text-white p-6 text-center">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black">Reçu de mission</h2>
          <p className="text-slate-400 text-sm">AngelWatch — La Réunion</p>
        </div>

        {/* Receipt content */}
        <div className="p-6 space-y-6" id="receipt-content">
          {/* Receipt info */}
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-slate-500">N° Reçu</p>
              <p className="font-bold text-slate-800">{receiptNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500">Date</p>
              <p className="font-bold text-slate-800">{date}</p>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Trip details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Départ</p>
                <p className="font-medium text-slate-800">{request.pickupAddress || 'Position du client'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Destination</p>
                <p className="font-medium text-slate-800">{request.destination}</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Client & Driver */}
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-slate-500">Client</p>
              <p className="font-bold text-slate-800">{clientName || request.clientName}</p>
            </div>
            {driverName && (
              <div className="text-right">
                <p className="text-slate-500">Chauffeur</p>
                <p className="font-bold text-slate-800">{driverName}</p>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Course ({receipt.distance} km)</span>
              <span className="font-medium">€{receipt.rideFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Frais de service (10%)</span>
              <span className="font-medium">€{receipt.serviceFee.toFixed(2)}</span>
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex justify-between">
              <span className="font-bold text-slate-800">Total payé</span>
              <span className="font-black text-xl text-primary">€{receipt.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-1">
            <p className="text-xs text-slate-400">Merci pour votre confiance</p>
            <p className="text-[10px] text-slate-300">AngelWatch — La sécurité routière est l'affaire de tous</p>
            <p className="text-[10px] text-slate-300">SIRET: 123 456 789 00012 • contact@angelwatch.re</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-2xl"
            onClick={onClose}
          >
            <X className="w-4 h-4 mr-2" /> Fermer
          </Button>
          <Button
            className="flex-1 h-12 rounded-2xl bg-accent hover:bg-accent/90"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" /> Imprimer
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-content, #receipt-content * { visibility: visible; }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
