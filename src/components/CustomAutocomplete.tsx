import { Autocomplete } from "@base-ui-components/react";
import classNames from "classnames";
import React from "react";
import { isNullOrUndefinedOrBlank, strEquals } from "../lib/helpers/GlobalHelper.ts";
import { ICON } from "../lib/consts.ts";

export type CustomAutocompleteProps = {
  placeholder?: string,
  items: any[],
  filter: (item: any, query: string) => boolean,
  getLabel: (item: any) => string,
  empty?: (query: string) => React.ReactNode,
  selectItem: (item: any) => void,
  compact?: boolean,
  tall?: boolean,
  short?: boolean,
  centered?: boolean,
  required?: boolean,
  hasError?: boolean,
  errorMsg?: string,
  disabled?: boolean,
  ref?: React.Ref<any>,
  maxLength?: number,
  showLength?: boolean,
  hasOutline?: boolean,
  canAddUndefined?: boolean,
}

export function CustomAutocomplete(props: CustomAutocompleteProps) {
  const [searchValue, setSearchValue] = React.useState('');

  var inputClasses = classNames(
    "w-full col-start-1 row-start-1 px-2 text-black border-grey-300 rounded-md focus-within:border-primary focus:outline-none",
    {
      "border": props.hasOutline !== false,
      "h-10": props.tall,
      "h-6": props.short,
      "text-center": props.centered,
      "mb-2": !props.compact,
      "bg-grey-200": props.disabled,
      "border-primary bg-primary-lighter placeholder:text-primary-darker": props.required && isNullOrUndefinedOrBlank(searchValue) || props.hasError,
    });

  return <Autocomplete.Root
    items={props.items}
    itemToStringValue={props.getLabel}
    value={searchValue}
    filter={props.filter}
    onValueChange={(value, details) => {
      if (details.reason !== 'item-press') {
        setSearchValue(value);
      } else {
        props.selectItem(props.items.find(x => strEquals(props.getLabel(x), value)) ?? searchValue);
        setSearchValue("");
      }
    }}
    >
    <Autocomplete.Input className={inputClasses} placeholder={props.placeholder}/>
    <Autocomplete.Portal>
      <Autocomplete.Positioner align="start" className="outline-none" sideOffset={4}>
        <Autocomplete.Popup className="w-full p-2 overflow-y-auto bg-white border rounded-lg max-h-[50svh] border-primary">
          {
            props.canAddUndefined && props.empty && <Autocomplete.Empty>
              {props.empty?.(searchValue)}
            </Autocomplete.Empty>
          }
          <Autocomplete.List>
            {
              (item) => (
                <Autocomplete.Item
                  key={item.id}
                  className="flex py-2 pl-4 pr-8 text-base leading-4 rounded outline-none cursor-pointer select-none hover:text-white hover:bg-primary"
                  value={item}
                >
                  {props.getLabel(item)}
                </Autocomplete.Item>
              )
            }
          </Autocomplete.List>
          {
            props.canAddUndefined && !props.items.some(x => strEquals(props.getLabel(x), searchValue)) &&
            <Autocomplete.Item
              className="flex items-center py-2 pl-4 pr-8 text-base leading-4 outline-none cursor-pointer select-none hover:text-white hover:rounded hover:bg-primary"
              >
              <img className="size-4" src={ICON.addBlack}/> {searchValue}
            </Autocomplete.Item>
          }
        </Autocomplete.Popup>
      </Autocomplete.Positioner>
    </Autocomplete.Portal>
  </Autocomplete.Root>
}