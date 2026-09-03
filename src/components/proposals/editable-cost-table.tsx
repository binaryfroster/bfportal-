"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/src/components/ui/table';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/src/lib/utils';
import { ProposalCostLineItem, ProposalCurrency } from '@/src/types';

interface EditableCostTableProps {
  lineItems: ProposalCostLineItem[];
  currency: ProposalCurrency;
  taxRate: number;
  discount: number;
  onLineItemsChange: (items: ProposalCostLineItem[]) => void;
  onTaxRateChange: (rate: number) => void;
  onDiscountChange: (discount: number) => void;
  readOnly?: boolean;
}

function formatAmount(amount: number, currency: ProposalCurrency): string {
  const symbols = { USD: '$', GBP: '£', INR: '₹' };
  return `${symbols[currency] || ''}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function EditableCostTable({
  lineItems,
  currency,
  taxRate,
  discount,
  onLineItemsChange,
  onTaxRateChange,
  onDiscountChange,
  readOnly = false
}: EditableCostTableProps) {
  
  const handleItemChange = (index: number, field: keyof ProposalCostLineItem, value: any) => {
    if (readOnly) return;
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto calculate amount
    if (field === 'hours' || field === 'rate') {
      const hours = Number(newItems[index].hours) || 0;
      const rate = Number(newItems[index].rate) || 0;
      newItems[index].amount = hours * rate;
    }
    
    onLineItemsChange(newItems);
  };

  const handleAddItem = () => {
    if (readOnly) return;
    const newItem: ProposalCostLineItem = {
      id: Date.now().toString(),
      category: 'New Category',
      description: 'Description',
      hours: 0,
      rate: 0,
      amount: 0
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    if (readOnly) return;
    const newItems = [...lineItems];
    newItems.splice(index, 1);
    onLineItemsChange(newItems);
  };

  const { subtotal, taxAmount, grandTotal } = useMemo(() => {
    const sub = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const tax = sub * (taxRate / 100);
    const grand = sub + tax - discount;
    return { subtotal: sub, taxAmount: tax, grandTotal: grand };
  }, [lineItems, taxRate, discount]);

  return (
    <div className="w-full bg-bg-card rounded-md border border-border-custom overflow-hidden">
      <Table>
        <TableHeader className="bg-bg-secondary">
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Hours</TableHead>
            <TableHead className="text-right">Rate (/hr)</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            {!readOnly && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence initial={false}>
            {lineItems.map((item, idx) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-b border-border-custom hover:bg-bg-secondary/50 transition-colors"
              >
                <TableCell>
                  {readOnly ? (
                    <span className="text-text-primary">{item.category}</span>
                  ) : (
                    <Input 
                      value={item.category}
                      onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                      className="h-8 bg-transparent border-transparent focus:border-accent-primary"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    <span className="text-text-primary">{item.description}</span>
                  ) : (
                    <Input 
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="h-8 bg-transparent border-transparent focus:border-accent-primary"
                    />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {readOnly ? (
                    <span className="font-mono text-text-secondary">{item.hours}</span>
                  ) : (
                    <Input 
                      type="number"
                      value={item.hours}
                      onChange={(e) => handleItemChange(idx, 'hours', Number(e.target.value))}
                      className="h-8 bg-transparent border-transparent focus:border-accent-primary text-right font-mono"
                    />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {readOnly ? (
                    <span className="font-mono text-text-secondary">{formatAmount(item.rate, currency)}</span>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-text-muted">{formatAmount(0, currency).charAt(0)}</span>
                      <Input 
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                        className="h-8 w-24 bg-transparent border-transparent focus:border-accent-primary text-right font-mono"
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-text-primary">
                  {formatAmount(item.amount, currency)}
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteItem(idx)}
                      className="text-text-muted hover:text-brand-error hover:bg-brand-error/10 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                )}
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
      
      {!readOnly && (
        <div className="p-2 border-t border-border-custom bg-bg-secondary/30">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleAddItem}
            className="text-accent-primary hover:text-accent-hover hover:bg-accent-primary/10 text-xs flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Row
          </Button>
        </div>
      )}

      <div className="border-t border-border-custom bg-bg-secondary p-4 flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Subtotal</span>
            <span className="font-mono text-text-primary">{formatAmount(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Tax Rate (%)</span>
            {readOnly ? (
              <span className="font-mono text-text-primary">{taxRate}%</span>
            ) : (
              <Input 
                type="number"
                value={taxRate}
                onChange={(e) => onTaxRateChange(Number(e.target.value))}
                className="h-8 w-20 text-right font-mono bg-bg-primary border-border-custom"
              />
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Tax Amount</span>
            <span className="font-mono text-text-primary">{formatAmount(taxAmount, currency)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Discount</span>
            {readOnly ? (
              <span className="font-mono text-brand-error">-{formatAmount(discount, currency)}</span>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-text-muted">-</span>
                <Input 
                  type="number"
                  value={discount}
                  onChange={(e) => onDiscountChange(Number(e.target.value))}
                  className="h-8 w-24 text-right font-mono bg-bg-primary border-border-custom"
                />
              </div>
            )}
          </div>
          <div className="pt-2 mt-2 border-t border-border-custom flex justify-between items-center">
            <span className="font-semibold text-text-primary">Grand Total</span>
            <span className="font-mono font-bold text-accent-primary text-lg" style={{ textShadow: 'var(--shadow-glow)' }}>
              {formatAmount(grandTotal, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
