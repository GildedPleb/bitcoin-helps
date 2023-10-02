import styled from "@emotion/styled";
import React, { useCallback } from "react";
import Select, {
  components as selectComponents,
  type OptionProps,
  type OptionsOrGroups,
  type StylesConfig,
} from "react-select";

import { type GroupType, type OptionType } from "../../../graphql/generated";
import { type LanguageOptionType } from "../../../providers/language/types";
import { type OptionTypeMapped } from "../../pages/landing";
import LoadingDots from "../loading-dots";

const SELECTOR_FOR_INPUT_PAIR = "selector-for-input-pair";

const StyledSelect = styled.select<{ valueNotNull: boolean; isRtl: boolean }>`
  background-color: white;
  height: 100%;
  width: auto;
  max-width: 50vw;
  padding: 0 1em;
  border-radius: 3em;
  border-color: black;
  color: ${(properties) => (properties.valueNotNull ? "black" : "#D0D0D0")};
  outline: none;
  box-shadow: none;
  transition: all 0.3s;
  border-width: 2px;
  border-style: solid;
  font-size: inherit;
  margin: 0;
  margin-right: ${(properties) => (properties.isRtl ? ".3em" : "0")};
  margin-left: ${(properties) => (properties.isRtl ? "0" : ".3em")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: ${(properties) => (properties.isRtl ? "rtl" : "ltr")};
  text-align: ${(properties) => (properties.isRtl ? "right" : "left")};
`;

const inputStyles = (
  itemNumber: number,
  isRtl: boolean,
  valueNotNull: boolean
): StylesConfig<OptionType, false> => ({
  container: (base) => ({
    ...base,
    height: "100%",
  }),
  placeholder: (base) => ({
    ...base,
    color: valueNotNull ? "black" : "#D0D0D0",
  }),
  control: (base, { isFocused }) => ({
    ...base,
    maxWidth: "calc(min(1300px, 50vw))",
    borderRadius: "3em",
    borderColor: "black",
    padding: "0 1em",
    margin: "0",
    marginRight: isRtl ? ".3em" : "0",
    marginLeft: isRtl ? "0" : ".3em",
    transition: "all 0.3s",
    height: "100%",
    outline: "none",
    boxShadow: "none",
    borderWidth: "2px",
    "&:hover": !isFocused && { border: "2px solid orange", cursor: "pointer" },
    "&:focus": {
      border: "2px solid #2684FF",
    },
    ...(valueNotNull &&
      !isFocused && {
        border: "2px solid black",
      }),
  }),
  menuList: (provided) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const alignment = isRtl ? ("right" as any) : ("left" as any);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const textAlign = itemNumber === 0 ? ("center" as any) : alignment;

    return {
      ...provided,
      width: "75vw",
      maxWidth: "1300px",
      lineHeight: "1",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      textAlign,
    };
  },
  menu: (provided) => {
    const selectBox = document.querySelectorAll(`.${SELECTOR_FOR_INPUT_PAIR}`);
    const selectBoxRect = selectBox[itemNumber].getBoundingClientRect();

    return {
      ...provided,
      position: "fixed",
      maxWidth: "1300px",
      width: "75vw",
      left: "50%",
      top: `${selectBoxRect.bottom}px`,
      transform: "translate(-50%)",
    };
  },
});

interface ExtendedOptionType extends OptionType {
  status?: string; // 'generating', 'ready' or undefined
}

interface SelectorProperties {
  language: LanguageOptionType;
  value: OptionTypeMapped | undefined;
  onChange: (newValue: any) => void;
  options: OptionsOrGroups<ExtendedOptionType, GroupType> | undefined;
  placeholder?: string;
  selectorKey: 0 | 1 | 2;
}

const components = {
  // eslint-disable-next-line unicorn/no-null
  IndicatorSeparator: () => null,
  Option: ({
    data,
    isRtl,
    ...properties
  }: OptionProps<ExtendedOptionType, false>) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <selectComponents.Option {...properties} data={data} isRtl={isRtl}>
      {data.status === "generating" ? (
        <LoadingDots text={data.label} small="1em" />
      ) : (
        data.label
      )}
    </selectComponents.Option>
  ),
};

const isMobileDevice = () =>
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent
  );

/**
 *
 * @param root0 - Selector props
 */
function Selector({
  language,
  value,
  onChange,
  options,
  placeholder = "",
  selectorKey,
}: SelectorProperties) {
  const update = useCallback(
    (newValue: OptionTypeMapped | null) => {
      onChange(newValue ?? undefined);
    },
    [onChange]
  );
  const noOptionsMessage = useCallback(
    () => language.translations?.selectNoMatch,
    [language.translations?.selectNoMatch]
  );
  const isRtl = language.direction === "rtl";
  const valueNotNull = Boolean(value);
  const handleDisabled = useCallback(
    (option: ExtendedOptionType) => option.status === "generating",
    []
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value: changeValue } = event.target;
      let selectedOption: OptionType | undefined;

      if (options) {
        for (const optionOrGroup of options) {
          if ("options" in optionOrGroup) {
            const foundOption = optionOrGroup.options.find(
              (option) => option.value === changeValue
            );
            if (foundOption) {
              selectedOption = foundOption;
              break;
            }
          } else if (optionOrGroup.value === changeValue) {
            selectedOption = optionOrGroup;
            break;
          }
        }
      }

      if (selectedOption) onChange(selectedOption);
    },
    [onChange, options]
  );

  return isMobileDevice() ? (
    <StyledSelect
      valueNotNull={Boolean(value)}
      isRtl={isRtl}
      onChange={handleChange}
      value={value?.value ?? ""}
    >
      <option disabled value="">
        {placeholder}
      </option>
      {options?.map((optionOrGroup) => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
        if ((optionOrGroup as GroupType).options) {
          const group = optionOrGroup as GroupType;
          return (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          );
        }
        const option = optionOrGroup as OptionType;
        return (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        );
      })}
    </StyledSelect>
  ) : (
    <Select
      key={language.value}
      isRtl={isRtl}
      className={SELECTOR_FOR_INPUT_PAIR}
      value={value}
      onChange={update}
      options={options}
      isSearchable
      placeholder={placeholder}
      noOptionsMessage={noOptionsMessage}
      styles={inputStyles(selectorKey, isRtl, valueNotNull)}
      components={components}
      isOptionDisabled={handleDisabled}
    />
  );
}

export default Selector;
