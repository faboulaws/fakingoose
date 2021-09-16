# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.2.1](https://github.com/faboulaws/fakingoose/compare/v2.2.0...v2.2.1) (2021-09-16)


### Bug Fixes

* use enum values when generating numbers. fixes issue [#47](https://github.com/faboulaws/fakingoose/issues/47) ([29d832c](https://github.com/faboulaws/fakingoose/commit/29d832cef3b5daad4e91aa24bf257a126fd48fc6))

## [2.2.0](https://github.com/faboulaws/fakingoose/compare/v2.1.0...v2.2.0) (2021-07-16)


### Features

* added support for population of related entities - fixes [#42](https://github.com/faboulaws/fakingoose/issues/42) ([d781133](https://github.com/faboulaws/fakingoose/commit/d78113359902c9e9545faddbf2f1297f9c57da2b))

## [2.1.0](https://github.com/faboulaws/fakingoose/compare/v2.0.4...v2.1.0) (2021-07-16)


### Features

* added option override per mock generation (solves issue [#39](https://github.com/faboulaws/fakingoose/issues/39)) ([7baa473](https://github.com/faboulaws/fakingoose/commit/7baa473ac4be4df01062c447d2a552fffd62ba6e))

### [2.0.4](https://github.com/faboulaws/fakingoose/compare/v2.0.3...v2.0.4) (2021-07-16)


### Bug Fixes

* issue [#40](https://github.com/faboulaws/fakingoose/issues/40) override options with static values ([3c08e0b](https://github.com/faboulaws/fakingoose/commit/3c08e0b61575c6c8b525cbd6e08cc0aa43ab7bc8))

### [2.0.3](https://github.com/faboulaws/fakingoose/compare/v2.0.2...v2.0.3) (2021-05-15)


### Bug Fixes

* [#33](https://github.com/faboulaws/fakingoose/issues/33) optional generic type inference ([010a2c0](https://github.com/faboulaws/fakingoose/commit/010a2c04696c3f075e3b8869bcc48c638d5e1c2f))
* [#33](https://github.com/faboulaws/fakingoose/issues/33) optional generic type inference ([ce827df](https://github.com/faboulaws/fakingoose/commit/ce827df40c45b85a7c1a3d912a08d41ca749ec74))

### [2.0.2](https://github.com/faboulaws/fakingoose/compare/v2.0.1...v2.0.2) (2021-05-14)


### Bug Fixes

* issue [#38](https://github.com/faboulaws/fakingoose/issues/38) - Array of enums fails to cast ([5e44768](https://github.com/faboulaws/fakingoose/commit/5e4476832c0d0f466a6b76fc0c63539069f60db1))

### [2.0.1](https://github.com/faboulaws/fakingoose/compare/v2.0.0...v2.0.1) (2021-05-14)


### Bug Fixes

* make options optional issue [#33](https://github.com/faboulaws/fakingoose/issues/33) ([d3c0e02](https://github.com/faboulaws/fakingoose/commit/d3c0e0285517bf0a8a85cac9115bed087b08e08c))

## [2.0.0](https://github.com/faboulaws/fakingoose/compare/v1.5.7...v2.0.0) (2021-03-05)


### ⚠ BREAKING CHANGES

* factory is no longer a fault export.
Old API:  `const factory = require('fakingoose');`.
New API `const {factory} = require('fakingoose');`

### Features

* migration to typescript ([8e40c99](https://github.com/faboulaws/fakingoose/commit/8e40c992239931d72b574c247e13b2b781688534))

### [1.5.7](https://github.com/faboulaws/fakingoose/compare/v1.5.6...v1.5.7) (2021-03-04)

### [1.5.6](https://github.com/faboulaws/fakingoose/compare/v1.5.5...v1.5.6) (2021-03-03)


### Bug Fixes

* issue [#32](https://github.com/faboulaws/fakingoose/issues/32) - static values ([0b606a0](https://github.com/faboulaws/fakingoose/commit/0b606a03338ec1c2c1e0b1dcdd6c07effe4a3803))

### [1.5.5](https://github.com/faboulaws/fakingoose/compare/v1.5.4...v1.5.5) (2021-03-01)


### Bug Fixes

* issue [#32](https://github.com/faboulaws/fakingoose/issues/32) ([7f3f73d](https://github.com/faboulaws/fakingoose/commit/7f3f73d503f33e6b9fcc27950bb35bc302e940ba))

### [1.5.4](https://github.com/faboulaws/fakingoose/compare/v1.5.3...v1.5.4) (2021-02-14)


### Bug Fixes

* fix date min & max issue [#31](https://github.com/faboulaws/fakingoose/issues/31) ([43a43c0](https://github.com/faboulaws/fakingoose/commit/43a43c001499141a21ca8d7e7ce6e31cd857091a))

### [1.5.2](https://github.com/faboulaws/fakingoose/compare/v1.5.1...v1.5.2) (2021-02-09)


### Bug Fixes

* comment out mongoose3 ([271170e](https://github.com/faboulaws/fakingoose/commit/271170ed3fbca42002063dafc996e2be4696f32b))
* issue [#30](https://github.com/faboulaws/fakingoose/issues/30) ([3c18d6f](https://github.com/faboulaws/fakingoose/commit/3c18d6f3b8d6b02c72a95d15e2f377757c3756ca))

### [1.5.1](https://github.com/faboulaws/fakingoose/compare/v1.5.0...v1.5.1) (2020-11-15)

## [1.5.0](https://github.com/faboulaws/fakingoose/compare/v1.4.1...v1.5.0) (2020-11-15)


### Features

* added global option for objectid and decimal128 ([1519011](https://github.com/faboulaws/fakingoose/commit/15190116b3cdc34e85f9aa08d3d957038cd88b57))

### [1.4.1](https://github.com/faboulaws/fakingoose/compare/v1.4.0...v1.4.1) (2020-11-14)


### Bug Fixes

* package.json & package-lock.json to reduce vulnerabilities ([3af7ea7](https://github.com/faboulaws/fakingoose/commit/3af7ea773bbe9cd424b8fdae3b8254e6357b760d))
* upgrade bson-objectid from 1.3.0 to 1.3.1 ([03d46be](https://github.com/faboulaws/fakingoose/commit/03d46be5e496ef057e49754199a5a6bb403fa6b6))
* upgrade chance from 1.1.5 to 1.1.6 ([4069208](https://github.com/faboulaws/fakingoose/commit/4069208bd52080bea03212be427febd6c3bb20c2))

## [1.4.0](https://github.com/faboulaws/fakingoose/compare/v1.3.3...v1.4.0) (2020-11-14)


### Features

* added the tostring option to Decimal128 generator ([f618699](https://github.com/faboulaws/fakingoose/commit/f61869997f5109791d3518660a3ea32f80cf0314))


### Bug Fixes

* upgrade chance from 1.1.4 to 1.1.5 ([e89e0ad](https://github.com/faboulaws/fakingoose/commit/e89e0ad824712c1bdda787541d1557eac68b031e))

### [1.3.3](https://github.com/faboulaws/fakingoose/compare/v1.3.2...v1.3.3) (2020-03-13)

### [1.3.2](https://github.com/faboulaws/fakingoose/compare/v1.3.1...v1.3.2) (2020-03-13)


### Bug Fixes

* **package:** update flat to version 5.0.0 ([68819ca](https://github.com/faboulaws/fakingoose/commit/68819ca))

### [1.3.1](https://github.com/faboulaws/fakingoose/compare/v1.3.0...v1.3.1) (2019-10-06)

## [1.3.0](https://github.com/faboulaws/fakingoose/compare/v1.2.2...v1.3.0) (2019-10-06)


### Features

* added the 'tostring' option to ObjectId generator ([b4bcbd3](https://github.com/faboulaws/fakingoose/commit/b4bcbd3))

### [1.2.2](https://github.com/faboulaws/fakingoose/compare/v1.2.1...v1.2.2) (2019-09-16)

### [1.2.1](https://github.com/faboulaws/fakingoose/compare/v1.2.0...v1.2.1) (2019-09-01)


### Bug Fixes

* array support for *options.<propertyName>.value* ([2a328c2](https://github.com/faboulaws/fakingoose/commit/2a328c2))

## [1.2.0](https://github.com/faboulaws/fakingoose/compare/v1.1.0...v1.2.0) (2019-09-01)


### Features

* allow nested key when defining property value via options ([888161f](https://github.com/faboulaws/fakingoose/commit/888161f))
* improved support for options.propertyName.value ([6174f73](https://github.com/faboulaws/fakingoose/commit/6174f73))

## [1.1.0](https://github.com/faboulaws/fakingoose/compare/v1.0.10...v1.1.0) (2019-08-31)


### Features

*  added the ability to skip nested properties ([2899ab6](https://github.com/faboulaws/fakingoose/commit/2899ab6))

### [1.0.10](https://github.com/faboulaws/fakingoose/compare/v1.0.9...v1.0.10) (2019-08-29)


### Bug Fixes

*  issue [[#3](https://github.com/faboulaws/fakingoose/issues/3)] ([5ebce0f](https://github.com/faboulaws/fakingoose/commit/5ebce0f))

### [1.0.9](https://github.com/faboulaws/fakingoose/compare/v1.0.8...v1.0.9) (2019-08-29)

### [1.0.8](https://github.com/faboulaws/fakingoose/compare/v1.0.7...v1.0.8) (2019-08-28)


### Bug Fixes

* issue [#6](https://github.com/faboulaws/fakingoose/issues/6) ([0b65923](https://github.com/faboulaws/fakingoose/commit/0b65923))

### 1.0.7 (2019-08-16)

## 1.0.6 (2019-08-14)
Documentation update

## 1.0.5 (2019-08-14)
- Remove `mongoose` dependency

## 1.0.4 (2019-08-13)
Issue fixes
- [Issue #4](https://github.com/faboulaws/fakingoose/issues/4)
- [Issue #3](https://github.com/faboulaws/fakingoose/issues/3)

## 1.0.1 - 1.0.3 (2019-08-12)
Documentation update

## 1.0.1 - 1.0.2 (2019-08-12)
Documentation update

## 1.0.0 (2019-08-12)
First version