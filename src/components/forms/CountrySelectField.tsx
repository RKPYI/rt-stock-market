'use client'

import React, { useState, useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import countryList from 'react-select-country-list'
import Image from 'next/image'
import { getFlagEmoji } from '@/helpers/getFlagEmoji'

const CountrySelectField = ({ name, label, control, error, required = false }: CountrySelectProps) => {
  const [open, setOpen] = useState(false)
  const countries = useMemo(() => countryList().getData(), [])

  return (
    <div className='space-y-2'>
      <Label htmlFor={name} className='form-label'>{label}</Label>
      <Controller
        name={name}
        control={control}
        rules={{ required: required ? `Please select ${label.toLowerCase()}` : false }}
        render={({ field }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="select-trigger w-full justify-between"
              >
                {field.value
                  ? countries.find((country) => country.value === field.value)?.label
                  : `Select ${label.toLowerCase()}...`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent style={{ width: 'var(--radix-popover-trigger-width)' }} className="p-0 bg-gray-800 border-gray-600" align='start'>
              <Command className='bg-gray-800'>
                <CommandInput placeholder={`Search ${label.toLowerCase()}...`} className='text-white' />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.value}
                        value={country.label}
                        onSelect={() => {
                          field.onChange(country.value)
                          setOpen(false)
                        }}
                        className='text-white hover:bg-gray-700 cursor-pointer'
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            field.value === country.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <span className='mr-2'>{getFlagEmoji(country.value)}</span>
                        {country.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      />
      {error && <p className='text-sm text-red-500'>{error.message}</p>}
    </div>
  )
}

export default CountrySelectField