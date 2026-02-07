'use client';

import { useState } from 'react';
import { Utensils, X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { RestaurantMenu, RestaurantMenuItem } from '@/src/generator/types';
import { toast } from 'sonner';

interface MenuUploaderProps {
    menus: RestaurantMenu[];
    onChange: (menus: RestaurantMenu[]) => void;
}

export default function MenuUploader({ menus, onChange }: MenuUploaderProps) {
    const [rawText, setRawText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const handleParse = () => {
        setIsParsing(true);
        try {
            const sections = rawText.split(/\n\s*\n/);
            const newMenus: RestaurantMenu[] = [];

            sections.forEach(section => {
                const lines = section.trim().split('\n');
                if (lines.length === 0) return;

                // STATE-AWARE ROBUST PARSING
                // Strict Price Regex: Requires $ OR decimal part (.xx or ,xx)
                const priceRegex = /\$\d+([.,]\d{2})?|\d+([.,]\d{2})/;

                // Determine if first line is a title or an item
                let title = 'General Menu';
                let startIndex = 0;

                const firstLine = lines[0]?.trim();
                // Clean the line for checking (remove parentheses content for price detection)
                const checkLine = (l: string) => l.replace(/\([^)]*\)/g, '');

                if (firstLine && !checkLine(firstLine).match(priceRegex)) {
                    title = firstLine;
                    startIndex = 1;
                }

                const items: RestaurantMenuItem[] = [];

                for (let i = startIndex; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const cleanForPrice = checkLine(line);
                    const priceMatch = cleanForPrice.match(priceRegex);

                    if (priceMatch) {
                        const price = priceMatch[0];
                        const priceIndex = line.indexOf(price);

                        const name = line.substring(0, priceIndex).trim().replace(/[-|.\s]+$/, '') || 'Unnamed Item';
                        const description = line.substring(priceIndex + price.length).trim().replace(/^[-|.\s]+/, '');

                        items.push({ name, price, description });
                    } else if (items.length > 0) {
                        // NO PRICE: This is likely a description for the previous item
                        const lastItem = items[items.length - 1];
                        const newDesc = lastItem.description
                            ? `${lastItem.description} ${line}`
                            : line;
                        lastItem.description = newDesc;
                    } else {
                        // NO PRICE & NO PRIOR ITEM: Create as Name-only item
                        items.push({ name: line, price: '', description: '' });
                    }
                }

                if (items.length > 0) {
                    newMenus.push({ title, items });
                }
            });

            onChange([...menus, ...newMenus]);
            setRawText('');
            toast.success(`Successfully parsed ${newMenus.length} sections`);
        } catch (error) {
            console.error('[MenuUploader] Parse error', error);
            toast.error('Failed to parse menu text');
        } finally {
            setIsParsing(false);
        }
    };

    const removeMenu = (index: number) => {
        const nextMenus = [...menus];
        nextMenus.splice(index, 1);
        onChange(nextMenus);
    };

    const addItem = (menuIndex: number) => {
        const nextMenus = [...menus];
        nextMenus[menuIndex].items.push({ name: 'New Item', price: '$0.00' });
        onChange(nextMenus);
    };

    const removeItem = (menuIndex: number, itemIndex: number) => {
        const nextMenus = [...menus];
        nextMenus[menuIndex].items.splice(itemIndex, 1);
        onChange(nextMenus);
    };

    const updateItem = (menuIndex: number, itemIndex: number, field: keyof RestaurantMenuItem, value: string) => {
        const nextMenus = [...menus];
        nextMenus[menuIndex].items[itemIndex] = {
            ...nextMenus[menuIndex].items[itemIndex],
            [field]: value
        };
        onChange(nextMenus);
    };

    const updateMenuTitle = (menuIndex: number, title: string) => {
        const nextMenus = [...menus];
        nextMenus[menuIndex].title = title;
        onChange(nextMenus);
    };

    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-700/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-950 rounded-full flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-semibold text-white">Restaurant Menu</h3>
                        <p className="text-sm text-slate-400">Add food and drink items for your site</p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>

            {isExpanded && (
                <div className="p-6 border-t border-slate-700 space-y-8">
                    {/* Raw Text Input */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Paste Menu (Beta Parser)
                        </label>
                        <textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder={"Starters\nGarlic Bread - $5.00 - With cheese\nBruschetta - $8.00\n\nMains\nClassic Pizza - $15.00"}
                            rows={6}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition-all"
                        />
                        <button
                            onClick={handleParse}
                            disabled={!rawText.trim() || isParsing}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Parse & Add Sections
                        </button>
                    </div>

                    {/* Structured Menus */}
                    <div className="space-y-6">
                        {menus.map((menu, mIndex) => (
                            <div key={`menu-${mIndex}`} className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <input
                                        value={menu.title}
                                        onChange={(e) => updateMenuTitle(mIndex, e.target.value)}
                                        className="bg-transparent text-lg font-bold text-white border-b border-transparent hover:border-slate-600 focus:border-emerald-500 focus:outline-none px-1"
                                    />
                                    <button
                                        onClick={() => removeMenu(mIndex)}
                                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {menu.items.map((item, iIndex) => (
                                        <div key={`item-${mIndex}-${iIndex}`} className="flex items-start gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <div className="sm:col-span-2">
                                                    <input
                                                        value={item.name}
                                                        onChange={(e) => updateItem(mIndex, iIndex, 'name', e.target.value)}
                                                        placeholder="Item name"
                                                        className="w-full text-sm font-medium text-white bg-transparent focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        value={item.price}
                                                        onChange={(e) => updateItem(mIndex, iIndex, 'price', e.target.value)}
                                                        placeholder="Price"
                                                        className="w-full text-sm text-emerald-400 font-semibold bg-transparent focus:outline-none"
                                                    />
                                                </div>
                                                <div className="sm:col-span-4">
                                                    <input
                                                        value={item.description || ''}
                                                        onChange={(e) => updateItem(mIndex, iIndex, 'description', e.target.value)}
                                                        placeholder="Description (optional)"
                                                        className="w-full text-xs text-slate-400 bg-transparent focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeItem(mIndex, iIndex)}
                                                className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addItem(mIndex)}
                                        className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:border-slate-500 hover:text-slate-400 transition-all"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add Item
                                    </button>
                                </div>
                            </div>
                        ))}

                        {menus.length === 0 && (
                            <div className="text-center py-8 border border-dashed border-slate-700 rounded-xl bg-slate-900/30">
                                <Utensils className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">No menu sections added yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
